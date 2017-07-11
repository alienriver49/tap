import { inject, Factory } from 'aurelia-dependency-injection'
import Utilities from './../utilities/utilities';
import RpcClient from './../rpc/client'
import {ProxiedObservable, IArrayBindingSync, IPropertyBindingSync, IArrayChangedSplice} from './proxiedObservable'

export interface IChildMetadata {
    property: string;
    contextId: string;
    parentId: string;
    value: any;
}

export interface ISerializedObject {
    _childMetadata: IChildMetadata[],
    _syncObjectContextId: string,  // Used with propertyBindingSync messages
    [k: string]: any
}

@inject(Utilities, RpcClient, Factory.of(ProxiedObservable))
export class BindingEngine {
    constructor(
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _proxiedObservableFactory: (...args: any[]) => ProxiedObservable
    ) {
        _rpc.subscribe('tapfx.propertyBindingSync', this._onPropertyBindingSync.bind(this));
        _rpc.subscribe('tapfx.arrayBindingSync', this._onArrayBindingSync.bind(this));
    }

    private _className: string = (this as Object).constructor.name;
    private _contextIDMap: Map<Object, string> = new Map();
    private _contextObserversMap: Map<string, ProxiedObservable[]> = new Map();

    /**
     * Handler for 'tapfx.propertyBindingSync' RPC messages 
     * 
     * @param data 
     */
    private _onPropertyBindingSync(data: IPropertyBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Property binding sync.`, data);
        let allObservers = this._contextObserversMap.get(data.contextID)
        let observer = (allObservers || []).find((i) => {
            return i.property() === data.property;
        });
        if (observer){
            // If the new value is an object, recursively register it for observation
            if (this._utilities.isObject(data.newValue)){
                // The sender should have passed a contextID for the new object, so use that as the shared context key
                if (!data.syncObjectContextId)
                    console.error(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Sync object missing syncObjectContextId.`, data);
                else {
                    // Is the new object already in the context (ex, because it's referenced by something else already in
                    // the context)?  If so, assume it's already being observed and get the value from the context collection
                    // because that should be the latest (right???)
                    let existingObject: Object | null = null;
                    this._contextIDMap.forEach((value, key) => {
                        if (value === data.syncObjectContextId)
                        existingObject = key;
                    })
                    if (existingObject)
                        data.newValue = existingObject;
                    else{
                        this.resolveId(data.newValue, data.syncObjectContextId);
                        this._registerObjectBindings(data.syncObjectContextId, data.newValue, observer.extensionId)
                    }
                }
            }
            // TODO Dispose of observers on oldValue object in setValue function
            observer.setValue(data.newValue, true);
        }
    }

    /**
     * Recursively observe the passed object, 
     * Used by _onPropertyBindingSync 
     * @param objectID 
     * @param obj 
     * @param extensionId 
     * @param parentID 
     */
    private _registerObjectBindings(objectID: string, obj: ISerializedObject, extensionId: string, parentID?: string): void {
        // Recursively register any child objects first
        if (obj.hasOwnProperty('_childMetadata')){
            let childMetadata: IChildMetadata[] = obj['_childMetadata'];
            childMetadata.forEach((metadata) => {
                let childObject: ISerializedObject = metadata.value;

                // Is the object already mapped?  Lookup by contextId
                let existingObservers = this._contextObserversMap.get(objectID);
                if (existingObservers && existingObservers.length === 0){
                    let newContextID = this._utilities.newGuid();
                    this.resolveId(childObject, newContextID);
                    this._registerObjectBindings(metadata.contextId, childObject, extensionId, metadata.parentId);
                }
                // And reinstantiate them on the parent object
                obj[metadata.property] = childObject;
            });
        }

        if (!parentID){
            for (let prop in obj) {
                // only register object's own properties and not those on the prototype chain
                // anything starting with an underscore is treated as a private property and is not watched for changes
                // skip Functions
                if (obj.hasOwnProperty(prop) &&
                    prop.charAt(0) !== '_' &&
                    window.TapFx.Utilities.classOf(obj[prop]) !== '[object Function]'
                ) {
                    this.observe(obj, prop, extensionId);
                }
            }
        }
    }

    /**
     * Handler for 'tapfx.arrayBindingSync' RPC messages 
     * @param data 
     */
    private _onArrayBindingSync(data: IArrayBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Array binding sync.`, data);
        let allObservers = this._contextObserversMap.get(data.contextID)
        let observer = (allObservers || []).find((i) => {
            return i.property() === data.property;
        });

        // splice changes into the array
        data.splices.forEach((splice: IArrayChangedSplice) => {
            observer && observer.updateArray(splice, true);
        })
    }

    /**
     * Associates an ID with a context.
     * @param context Context owning the observable properties.
     * @param contextID An ID to associate with the context.
     */
    resolveId(context: Object, contextID: string): void {
        if (this._contextIDMap.has(context)) {
            throw new Error('Cannot resolve ID. An ID already exists for the specified context.');
        }
        this._contextIDMap.set(context, contextID);
        this._contextObserversMap.set(contextID, []);
    }

    observe(context: Object, property: string, extensionId: string = ""): IChildMetadata | null {
        // if it is the first property to be observed on the context, keep track of the context as being observed
        let contextID = this._contextIDMap.get(context);
        if (!contextID) {
            throw new Error("Missing context ID. The context ID must first be resolved before observing properties on the context.")
        }

        let metadata: IChildMetadata | null = null; 

        // make sure the property is not currently being observed
        let existingObserverIndex = (this._contextObserversMap.get(contextID) || []).findIndex((i) => {
            return i.property() === property;
        });

        if (existingObserverIndex === -1) {
            let observer = this._proxiedObservableFactory(contextID, context, property, extensionId);
            observer.observe();

            // keep track of the current observer            
            (this._contextObserversMap.get(contextID) || []).push(observer);
        }

        // If the property itself is an object, then recursively observe it
        if (this._utilities.isObject(context[property])){

            // If the context is already in the contextIDMap, assume it's being observed (and already
            // exists in the other window), so we just need to pass the shared contextID key
            // The other window will lookup the property based on the passed contextID key
            let existingContextId = this._contextIDMap.get(context[property]);
            if (existingContextId){
                metadata =  {
                    property: property,
                    contextId: existingContextId,
                    parentId: contextID,
                    value: null 
                };
            }else{
                let newContextID = this._contextIDMap.get(context[property]);
                if (!newContextID) {
                    newContextID = this._utilities.newGuid();
                    this.resolveId(context[property], newContextID);
                }
                // Ensure there are no existing observers for the object
                let existingObservers = this._contextObserversMap.get(newContextID);
                if (existingObservers && existingObservers.length === 0){
                    let serializedObject = this._recursiveObserve(newContextID, context[property], extensionId);
                    metadata =  {
                        property: property,
                        contextId: newContextID,
                        parentId: contextID,
                        value: serializedObject 
                    };
                }
            }
        }

        // TODO if the property is an array of objects, recursively observe the objects
        //this._observeArray(context[property], extensionId);

        return metadata;
    }

    /**
     * When an observed property is changed and the new property is an Object, this is called
     * from ProxiedObservable to ensure the new Object is being observed before syncing the 
     * new value and also to create a serialized version of the object
     * @param context 
     * @param extensionId 
     */
    public observeObject(context: Object, extensionId: string = ""): ISerializedObject | null {
        let serializedObject: ISerializedObject = {_childMetadata: [], _syncObjectContextId: ''};

        // If the context is already in the contextIDMap, assume it's being observed (and already
        // exists in the other window), so we just need to pass the shared contextID key
        // The other window will lookup the property based on the passed contextID key
        let existingContextId = this._contextIDMap.get(context);
        if (existingContextId){
            let serializedObject: ISerializedObject = {_childMetadata: [], _syncObjectContextId: existingContextId};
            return serializedObject;
        }

        // Not in the context map yet, so add it
        let newContextID = this._contextIDMap.get(context);
        if (!newContextID) {
            newContextID = this._utilities.newGuid();
            this.resolveId(context, newContextID);
        }
        // Ensure there are no existing observers for the object
        let existingObservers = this._contextObserversMap.get(newContextID);
        if (existingObservers && existingObservers.length === 0){
            serializedObject = this._recursiveObserve(newContextID, context, extensionId);
            serializedObject._syncObjectContextId = newContextID;
            return serializedObject;
        }
        return null;
    }

    /**
     * This is very similar to the Extension._registerBladeBindings functions
     * Iterate over all the properties in the passed object and begin observing them (if
     * they aren't already being observed).  A 'serialized' version of the object is 
     * created for passing to the other window.  For each property that itself is an object,
     * a metadata entry is added for proper syncing in the other window
     * @param context 
     * @param extensionId 
     */
    private _recursiveObserve(contextId: string, context: Object, extensionId: string = ""): ISerializedObject {

        let serializedObject: ISerializedObject = {_childMetadata: [], _syncObjectContextId: ''};

        for (let prop in context) {
            // only register objects own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (context.hasOwnProperty(prop) &&
                prop !== 'form' &&  // don't observe form
                prop.charAt(0) !== '_' &&
                this._utilities.classOf(context[prop]) !== '[object Function]'
            ) {
                // If the property is an object, we should include metadata
                // and the property will be reinstantiated using the metadata 
                // on the other side
                let childMetadata = this.observe(context, prop, extensionId);
                if (childMetadata)
                    serializedObject._childMetadata.push(childMetadata);
                else
                    // otherwise we copy of property as is
                    serializedObject[prop] = context[prop];
            }
        }
        return serializedObject;
    }

    public getContextById(contextId: string): Object | null {
        let existingObject: Object | null = null;
        this._contextIDMap.forEach((value, key) => {
            if (value === contextId)
                existingObject = key;
        })
        if (existingObject)
            return existingObject;
        return null;
    }

    /**
     * Recursively observe
     * I THINK ARRAYS OF ARRAYS NEED TO BE OBSERVED DIRECTLY IN PROXIEDOBSERVABLES
     * BECAUSE BINDINGENGINE ONLY DEALS WITH OBJECTS WITH PROPERTIES, NOT ARRAYS
     * OR NOT.... MORE THOUGHT NEEDED ON HANDLING OBSERVATION OF ARRAYS OF OBJECTS
     * @param context 
     * @param extensionId 
     */
    private _observeArray(context: any[], extensionId: string = ""): void{
        if (context && 
            context === Object(context) && 
            (context instanceof Array) &&
            (context as any[]).length > 0){
            let a = context as any[];
            if (a.length === 0)
                return;
            // For each element in the array, 
            a.forEach((item) => {
                if (item && item === Object(item)){ 
                    if (!(item instanceof Array) &&
                        this._utilities.classOf(item) !== '[object Function]'){

                        // If it's an object (and not array or function), observe it
                        this._recursiveObserve(item, extensionId);
                    }
                    if (item instanceof Array) {
                        // If it's another array, observe it
                        this._observeArray(item, extensionId);
                    }
                }
                
            });
        }

    }

    /**
     * Unobserve a specific context.
     * @param context 
     */
    unobserve(context: Object): void {
        // get this context from the map
        let contextID = this._contextIDMap.get(context);
        if (!contextID) {
            throw new Error("Couldn't find content ID when unobserving context.")
        }

        // dispose of any observers
        (this._contextObserversMap.get(contextID) || []).forEach((proxiedObservable) => {
            proxiedObservable.dispose();
        });

        // remove the context from the map
        this._contextIDMap.delete(context);
    }

    /**
     * Unobserve all contexts.
     */
    unobserveAll(): void {
        this._contextObserversMap.forEach((proxiedObservables, key) => {
            proxiedObservables.forEach((proxiedObservable) => proxiedObservable.dispose());
        });

        this._contextIDMap = new Map();
    }
}

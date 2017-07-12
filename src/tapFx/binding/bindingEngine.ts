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

// Reference to an object that could not be resolved
export interface IUnresolvedRef {
    context: Object,
    property: string,
    refId: string
}

interface IContextBindingMap {
    observers: ProxiedObservable[];
    functions: string[];
    // This is used as our ref counts
    // When observing a property, update this with the context's parent Id
    // When disposing of an observer, only dispose if the context's parent Id
    // is included here and is the only entry
    parentContextIds: Set<string>;
    isRoot: boolean;
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
    private _contextBindingMap: Map<string, IContextBindingMap> = new Map();
    private _seen: Object[] = [];
    private _seenFlag: string = '$$__checked__$$';
    private _unresolvedRefs: IUnresolvedRef[] = [];

    /**
     * Handler for 'tapfx.propertyBindingSync' RPC messages 
     * 
     * @param data 
     */
    private _onPropertyBindingSync(data: IPropertyBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Property binding sync.`, data);
        let bindingMap = this._contextBindingMap.get(data.contextID)
        let observer = ((bindingMap && bindingMap.observers) || []).find((i) => {
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
                        this.resolveId(data.newValue, data.syncObjectContextId, data.contextID);
                        this._registerObjectBindings(data.syncObjectContextId, data.newValue, observer.extensionId, data.contextID, true)
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
    private _registerObjectBindings(objectID: string, obj: ISerializedObject, extensionId: string, parentContextId: string, observeThis: boolean): void {
        if (!parentContextId){
            this._seen = [];
            this._unresolvedRefs = [];
        }
        
        // If this object has already been seen, don't dive in again
        if (obj.hasOwnProperty(this._seenFlag))
            return ;        

        // Recursively register any child objects first
        if (obj.hasOwnProperty('_childMetadata')){
            let childMetadata: IChildMetadata[] = obj['_childMetadata'];
            childMetadata.forEach((metadata) => {
                // Check if there is already a mapped context with the passed Id
                let existingChildObject = this.getContextById(metadata.contextId);

                if (existingChildObject){
                    // If so, we assume it's being observed and assign that to the parent object
                    obj[metadata.property] = existingChildObject;
                }else{
                    // If there is a value for the object, assign it
                    if (metadata.value){
                        let childObject: ISerializedObject = metadata.value;
                        // Must be an object, so add a temporary flag property to objects to prevent infinite loop from circular references
                        obj[this._seenFlag] = true;
                        this._seen.push(obj);

                        this.resolveId(childObject, metadata.contextId, parentContextId);
                        this._registerObjectBindings(metadata.contextId, childObject, extensionId, metadata.parentId, false);
                        // And reinstantiate them on the parent object
                        obj[metadata.property] = childObject;
                    }else{
                        // Otherwise reference will be resolved later
                        this._unresolvedRefs.push({context: obj, property: metadata.property, refId: metadata.contextId});
                    }
                }
            });
        }

        if (observeThis){
            // First resolve the unresolved references
            this._unresolvedRefs.forEach((ref) => {
                let existingObject = this.getContextById(ref.refId);
                if (!existingObject)
                    throw new Error(`Cannot resolve a reference for context Id: ${ref.refId}`);
                ref.context[ref.property] = existingObject;
            })
            // Remove the temporary flags from the objects
            this._seen.forEach((o) => {
                delete o[this._seenFlag];
            });

            let refIds: Set<string> = new Set<string>(); 
            for (let prop in obj) {
                // only register object's own properties and not those on the prototype chain
                // anything starting with an underscore is treated as a private property and is not watched for changes
                // skip Functions
                if (obj.hasOwnProperty(prop) &&
                    prop.charAt(0) !== '_' &&
                    !(obj[prop] instanceof Map) && !(obj[prop] instanceof Set) &&  // skip Maps and Sets for now
                    window.TapFx.Utilities.classOf(obj[prop]) !== '[object Function]'
                ) {
                    // Don't really care about the childMetadata created by observe at this point, but oh well
                    this.observe(obj, prop, refIds, extensionId, parentContextId);
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
        let bindingMap = this._contextBindingMap.get(data.contextID)
        let observer = ((bindingMap && bindingMap.observers ) || []).find((i) => {
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
     * @param contextID An ID to associate with the context (auto-generated if not passed)
     * @param parentContextId The context Id of the parent context
     */
    public resolveId(context: Object, contextId: string = '', parentContextId: string = ''): string {
        // If the context is already mapped, then just return the existing contextId (and update parentContextIds)
        if (this._contextIDMap.has(context)) {
            let myContextId = this._contextIDMap.get(context) || '';
            let bindingMap = this._contextBindingMap.get(myContextId)
            if (!bindingMap) {
                throw new Error(`Missing binding map for context Id: ${myContextId}. The binding map must first be created before observing properties on the context.`)
            }
            if (parentContextId && !bindingMap.parentContextIds.has(parentContextId))
                bindingMap.parentContextIds.add(parentContextId);
            return contextId;
        }else{
            // Otherwise create a new Id (unless passed one) and binding mapping for the context
            if (!contextId)
                contextId = this._utilities.newGuid();
            this._contextIDMap.set(context, contextId);
            let bindingMap: IContextBindingMap = {
                observers: [], 
                functions: [], 
                parentContextIds: new Set<string>(), 
                isRoot: !parentContextId 
            };
            if (parentContextId && !bindingMap.parentContextIds.has(parentContextId))
                bindingMap.parentContextIds.add(parentContextId);
            this._contextBindingMap.set(contextId, bindingMap);
            return contextId;
        }
    }

    public observe(context: Object, property: string, refIds: Set<string>, extensionId: string = "", parentContextId: string = ''): IChildMetadata | null {
        // if it is the first property to be observed on the context, keep track of the context as being observed
        let contextID = this._contextIDMap.get(context);
        if (!contextID) {
            throw new Error("Missing context ID. The context ID must first be resolved before observing properties on the context.")
        }

        let metadata: IChildMetadata | null = null; 

        // make sure the property is not currently being observed
        let bindingMap = this._contextBindingMap.get(contextID)
        if (!bindingMap) {
            throw new Error(`Missing binding map for context Id: ${contextID}. The binding map must first be created before observing properties on the context.`)
        }
        let existingObserverIndex = bindingMap.observers.findIndex((i) => {
            return i.property() === property;
        });

        if (existingObserverIndex === -1) {
            let observer = this._proxiedObservableFactory(contextID, context, property, extensionId);
            observer.observe();

            // keep track of the current observer            
            bindingMap.observers.push(observer);
        }

        // If the property itself is an object, then recursively observe it
        if (this._utilities.isObject(context[property])){

            // If the context is already in the contextIDMap (and already in the passed refId set), 
            // then assume it's being observed, so we just need to pass the shared contextID key
            // The other window will lookup the property object based on the passed contextID key
            // and the refIds set should ensure only one copy is passed
            let existingContextId = this._contextIDMap.get(context[property]);
            if (existingContextId && refIds.has(existingContextId)){
                metadata =  {
                    property: property,
                    contextId: existingContextId,
                    parentId: contextID,
                    value: null,
                };
            }else{
                let newContextId = this.resolveId(context[property], existingContextId, parentContextId);
                refIds.add(newContextId);
                let serializedObject = this._recursiveObserve(newContextId, context[property], parentContextId, refIds, extensionId);
                metadata =  {
                    property: property,
                    contextId: newContextId,
                    parentId: contextID,
                    value: serializedObject,
                };
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
    public observeObject(context: Object, parentContextId: string, refIds: Set<string>, extensionId: string): ISerializedObject | null {
        let serializedObject: ISerializedObject = {_childMetadata: [], _syncObjectContextId: ''};

        // If the context is already in the contextIDMap, assume it's being observed (and already
        // exists in the other window), so we just need to pass the shared contextID key
        // The other window will lookup the property based on the passed contextID key
        let contextId = this._contextIDMap.get(context);
        if (contextId){
            // Call resolveId to update the parentContextIds on the context
            this.resolveId(context, '', parentContextId);
            let serializedObject: ISerializedObject = {_childMetadata: [], _syncObjectContextId: contextId};
            return serializedObject;
        }else{
            // Not in the context map yet, so add it
            contextId = this.resolveId(context, '', parentContextId);
        }
        // Ensure there are no existing observers for the object
        let existingBindingMap = this._contextBindingMap.get(contextId)
        if (existingBindingMap && existingBindingMap.observers && existingBindingMap.observers.length === 0){
            serializedObject = this._recursiveObserve(contextId, context, parentContextId, refIds, extensionId);
            serializedObject._syncObjectContextId = contextId;
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
    private _recursiveObserve(contextId: string, context: Object, parentContextId: string, refIds: Set<string>, extensionId: string = ''): ISerializedObject {

        let serializedObject: ISerializedObject = {_childMetadata: [], _syncObjectContextId: ''};

        for (let prop in context) {
            // only register objects own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (context.hasOwnProperty(prop) &&
                prop !== 'form' &&  // don't observe form
                !(context[prop] instanceof Map) && !(context[prop] instanceof Set) &&  // skip Maps and Sets for now
                prop.charAt(0) !== '_' &&
                this._utilities.classOf(context[prop]) !== '[object Function]'
            ) {
                // If the property is an object, we should include metadata
                // and the property will be reinstantiated using the metadata 
                // on the other side
                let childMetadata = this.observe(context, prop, refIds, extensionId, parentContextId);
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

    public getIdByContext(context: Object): string | null {
        let existingContextId = this._contextIDMap.get(context);
        return existingContextId === void(0) ? null : existingContextId;
    }

    /**
     * Recursively observe
     * I THINK ARRAYS OF ARRAYS NEED TO BE OBSERVED DIRECTLY IN PROXIEDOBSERVABLES
     * BECAUSE BINDINGENGINE ONLY DEALS WITH OBJECTS WITH PROPERTIES, NOT ARRAYS
     * OR NOT.... MORE THOUGHT NEEDED ON HANDLING OBSERVATION OF ARRAYS OF OBJECTS
     * @param context 
     * @param extensionId 
     */
    // private _observeArray(context: any[], extensionId: string = ""): void{
    //     if (context && 
    //         context === Object(context) && 
    //         (context instanceof Array) &&
    //         (context as any[]).length > 0){
    //         let a = context as any[];
    //         if (a.length === 0)
    //             return;
    //         // For each element in the array, 
    //         a.forEach((item) => {
    //             if (item && item === Object(item)){ 
    //                 if (!(item instanceof Array) &&
    //                     this._utilities.classOf(item) !== '[object Function]'){

    //                     // If it's an object (and not array or function), observe it
    //                     this._recursiveObserve(item, extensionId);
    //                 }
    //                 if (item instanceof Array) {
    //                     // If it's another array, observe it
    //                     this._observeArray(item, extensionId);
    //                 }
    //             }
                
    //         });
    //     }

    // }

    /**
     * Unobserve a specific context.
     * @param context 
     */
    unobserve(context: Object): void {
        // get this context from the map
        let contextId = this._contextIDMap.get(context);
        if (!contextId) {
            throw new Error("Couldn't find content ID when unobserving context.")
        }

        // dispose of any observers
        let bindingMap = this._contextBindingMap.get(contextId);
        ((bindingMap && bindingMap.observers) || []).forEach((proxiedObservable) => {
            proxiedObservable.dispose();
        });

        // remove the context from the map
        this._contextIDMap.delete(context);
    }

    /**
     * Unobserve all contexts.
     */
    unobserveAll(): void {
        this._contextBindingMap.forEach((bindingMap, key) => {
            if (bindingMap.observers)
                bindingMap.observers.forEach((proxiedObservable) => proxiedObservable.dispose());
        });

        this._contextIDMap = new Map();
    }
}

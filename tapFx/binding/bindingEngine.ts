import { inject, Factory } from 'aurelia-dependency-injection'
import Utilities from './../utilities/utilities';
import RpcClient from './../rpc/client'
import {ProxiedObservable} from './proxiedObservable'
import {ProxiedCollectionObservable, IArrayBindingSync, IArrayChangedSplice} from './proxiedCollectionObservable'
import * as tapm from './../metadata/metadata'
import moment from 'moment';

export interface ISerializedObject{
    property: string;
    contextId: string;
    parentId: string;
    value: any;
    type: string;
    childMetadata: ISerializedObject[];
}

// Reference to an object that could not be resolved
export interface IUnresolvedRef {
    context: Object,
    property: string,
    refId: string
}

interface IObjectBindingMap {
    observers: ProxiedObservable[];
    functions: string[];
    // This is used as our ref counts
    // When observing a property, update this with a comma-delimited string of 
    // the context's parent Id and the context's property on the parent
    // When disposing of an observer, only dispose if the context's parent Id
    // is included here and is the only entry
    parentContextIds: Set<string>;
    isRoot: boolean;
}

interface ICollectionBindingMap {
    observer: ProxiedCollectionObservable | null;
    // This is used as our ref counts
    // When observing an object or array and one of it's properties or indexes is an array, 
    // then save that parent info here.
    // When disposing of an observer, only dispose if the context's parent Id
    // is included here and is the only entry
    // Values are comma-delimited string of the collection's parent context Id and
    // the property or index on the parent 
    parents: Set<string>;
}

export interface IBindingEngine {
    getIdByContext(context: Object): string | null;
    resolveSerializedObject(obj: ISerializedObject, node?: Object, firstTime?: boolean): Object;
    observeObject(metadata: ISerializedObject, context: Object, refIds: Set<string>, extensionId: string): ISerializedObject;
    unobserve(context: Object, parentContextId: string, contextId?: string, inRecursion?: boolean): void; 
}

export class SerializedType {
    public static readonly Primitive: string = 'p';
    public static readonly Array: string = 'a';
    public static readonly Object: string = 'o';
    public static readonly Date: string = 'd';
    public static readonly Set: string = 's';
    public static readonly Map: string = 'm';
}

@inject(Utilities, RpcClient, Factory.of(ProxiedObservable), Factory.of(ProxiedCollectionObservable))
export class BindingEngine {
    constructor(
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _proxiedObservableFactory: (...args: any[]) => ProxiedObservable,
        private _proxiedCollectionObservableFactory: (...args: any[]) => ProxiedCollectionObservable
    ) {
        _rpc.subscribe('tapfx.propertyBindingSync', this._onPropertyBindingSync.bind(this));
        _rpc.subscribe('tapfx.arrayBindingSync', this._onArrayBindingSync.bind(this));
    }

    private _className: string = (this as Object).constructor.name;
    private _contextIdMap: Map<Object, string> = new Map();
    private _contextBindingMap: Map<string, IObjectBindingMap> = new Map();
    private _collectionBindingMap: Map<string, ICollectionBindingMap> = new Map();
    private _seen: Object[] = [];
    private _seenFlag: string = '$$__checked__$$';
    private _unresolvedRefs: IUnresolvedRef[] = [];
    // Map of original arrays to proxy versions of the arrays
    private _arrayProxyMap: WeakMap<any[], any[]> = new WeakMap();

    /**
     * Handler for 'tapfx.propertyBindingSync' RPC messages 
     * 
     * @param data 
     */
    private _onPropertyBindingSync(data: ISerializedObject): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Property binding sync.`, data);

        let bindingMap = this.getBindingMap(data.parentId);
        let observer = ((bindingMap && (bindingMap as IObjectBindingMap).observers) || []).find((i) => {
            return i.property() === data.property;
        });
        if (observer){
            // If the old value was an object, dispose of any observers
            let context = this.getContextById(data.contextId);
            if (context && context[data.property] && this._utilities.isObject(context[data.property])){
                let oldValueContext = context[data.property];
                let oldValueContextId = this.getIdByContext(oldValueContext);
                // If oldValue is an object mapped in the BindingEngine, then
                // dispose of any observers on it
                if (oldValueContextId)
                    this.unobserve(oldValueContext, data.contextId,  data.property);
            }
            // TODO if the old value was an array, dispose of any observers

             // If the new value is an object or array, recursively register it for observation
             if (!this._utilities.isPrimitive(data.value)){
                 // First check if it already exists in the context
                let existingChildObject = this.getContextById(data.contextId);
                if (existingChildObject){
                    // If so, we assume it's being observed and assign that to the parent object
                    data.value = existingChildObject;
                }else{
                    switch(data.type.toLowerCase()){
                        case SerializedType.Object:
                            let resolvedObject: Object = {};
                            Object.assign(resolvedObject, data.value);
                            data.value = resolvedObject;
                            resolvedObject = this.resolveSerializedObject(data, resolvedObject, true);
                            // Then begin observing it (this handles observation of both objects and arrays)
                            // data.value is changed by observeObject, so don't use it after this
                            this.observeObject(data, resolvedObject, new Set<string>(), observer.extensionId);
                            data.value = resolvedObject;
                            break;
                        case SerializedType.Array:
                            let resolvedArray: any[] = data.value as any[];
                            this.resolveSerializedObject(data, {}, true);
                            // data.value is changed by observeObject, so don't use it after this
                            this.observeObject(data, data.value, new Set<string>(), observer.extensionId);
                            data.value = resolvedArray;
                            break;
                        case SerializedType.Date:
                            // Deserialize ISO date string to Date object
                            data.value = moment(data.value).toDate();
                            break;
                    }
                }
             }

             observer.setValue(data.value, true);
        }
    }
    
    /**
     * Handler for 'tapfx.arrayBindingSync' RPC messages 
     * @param data 
     */
    private _onArrayBindingSync(data: IArrayBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Array binding sync.`, data);
        let bindingMap = this._collectionBindingMap.get(data.contextId)
        if (!bindingMap || !bindingMap.observer){
            console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Could not find collection binding map or observer for context Id "${data.contextId}"`) 
            return;
        }

        let observer: ProxiedCollectionObservable = bindingMap.observer; 
        let addedMetadata: ISerializedObject[] = [];

        // splice changes into the array
        // This is broken into multiple steps to handle the possibility that 
        // multiple splices for the same array will be passed in the sync message
        // and we need to ensure all added elements in all splices are resolved before observing them
        // TODO?  Hmmmm, maybe the steps aren't needed after all because on the sending side the 
        // splices are serialized in enumerable order, so that should mean when deserializing
        // in the same order that as long as the current and any former splices have been resolved,
        // then it should be safe to observe and update the array contents without caring about 
        // later splices

        // step 1, resolve updated data
        data.splices.forEach((splice: IArrayChangedSplice) => {
            // Resolve and reinstantiate any new elements
            if (splice.addedCount && splice.added){
                this._seen = [];
                this._unresolvedRefs = [];
                splice.added.forEach((element: any, index: number, theArray: any[]) => {
                    addedMetadata.push(element);
                    if (this._utilities.isPrimitive(element)){
                        theArray[index] = element;
                    }else{
                        let serializedObject: ISerializedObject = element;
                        // First check if it already exists in the context
                        let existingChildObject = this.getContextById(serializedObject.contextId);
                        if (existingChildObject){
                            // If so, we assume it's being observed and assign that to the parent object
                            theArray[index] = existingChildObject;
                        }else{
                            switch(serializedObject.type){
                                case SerializedType.Array:
                                    let resolvedObject: Object = {};
                                    Object.assign(resolvedObject, serializedObject);
                                    serializedObject.value = resolvedObject;
                                    resolvedObject = this.resolveSerializedObject(serializedObject, resolvedObject, false);
                                    theArray[index] = resolvedObject;
                                    break;
                                case SerializedType.Object:
                                    theArray[index] = serializedObject.value;
                                    this.resolveSerializedObject(serializedObject, {}, false);
                                    break;
                                case SerializedType.Date:
                                    theArray[index] = moment(serializedObject.value).toDate();
                                    break;
                                default:
                                    theArray[index] = serializedObject.value;
                                    break;
                            }
                        }
                    }
                })

            }
        })

        // Step 2
        // resolve the unresolved references
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

        // Step 3
        // Observe any new elements (if they're objects or arrays)
        data.splices.forEach((splice: IArrayChangedSplice) => {
            // Observe new elements that are arrays or object 
            if (splice.addedCount && splice.added){
                splice.added.forEach((element: any, index: number, theArray: any[]) => {
                    if (!this._utilities.isPrimitive(element)){
                        let metadata = addedMetadata[index];
                        if ([SerializedType.Object, SerializedType.Array].indexOf(metadata.type) >= 0){
                            this.observeObject(metadata, element, new Set<string>(), observer.extensionId);
                        }
                    }
                })
            }

            // Update the parent array with the content changes
            observer.updateArray(splice, true);
        })
    }


    public resolveSerializedObject(obj: ISerializedObject, node: Object = {}, firstTime: boolean = false): Object {
        if (firstTime){
            this._seen = [];
            this._unresolvedRefs = [];
        }
        
        // If this object has already been seen, don't dive in again
        if (obj.hasOwnProperty(this._seenFlag))
            return {};        

        obj[this._seenFlag] = true;
        this._seen.push(obj);

        // node is our deserialized object without extraneous properties from the passed data
        if (!firstTime)
            node[obj.property] = obj.value;
        // else
        //     node = obj.value;

        this.resolveId(obj.value, obj.contextId, obj.parentId, obj.property);

        // Recursively register any child objects first
        // For objects, they're in the childMetadata
        if (obj.type === SerializedType.Object){
            obj.childMetadata.forEach((metadata) => {
                // Check if there is already a mapped context with the passed Id
                let existingChildObject = this.getContextById(metadata.contextId);
                if (existingChildObject){
                    // If so, we assume it's being observed and assign that to the parent object
                    // Updates node via object reference
                    (obj.value as Object)[metadata.property] = existingChildObject;
                }else{
                    if (metadata.value){
                        switch(metadata.type){
                            case SerializedType.Object:
                            case SerializedType.Array:
                                this.resolveSerializedObject(metadata);
                                break;
                            case SerializedType.Date:
                                metadata.value = moment(metadata.value).toDate();
                                break;
                        }
                        // And reinstantiate on parent (updates node via object reference)
                        (obj.value as Object)[metadata.property] = metadata.value;
                    }else{
                        // Otherwise reference will be resolved later
                        this._unresolvedRefs.push({context: obj.value, property: metadata.property, refId: metadata.contextId});
                    }
                }
            });
        }

        // For collections, they're in the value collection
        if (obj.type === SerializedType.Array){
            (obj.value as any[]).forEach((element: any, index: number, theArray: any[]) => {
                if (this._utilities.isPrimitive(element)){
                    theArray[index] = element;
                }else{
                    let serializedElement = element as ISerializedObject;
                    // Check if there is already a mapped context with the passed Id
                    let existingChildObject = this.getContextById(serializedElement.contextId);
                    if (existingChildObject){
                        // If so, we assume it's being observed and assign that to the parent object
                        // Updates node via array reference
                        theArray[serializedElement.property] = existingChildObject;
                    }else{
                        if (serializedElement.value){
                            switch(serializedElement.type){
                                case SerializedType.Object:
                                case SerializedType.Array:
                                    this.resolveSerializedObject(serializedElement);
                                    break;
                                case SerializedType.Date:
                                    serializedElement.value = moment(serializedElement.value).toDate();
                                    break;
                            }
                            // And reinstantiate on parent (updates node via array reference)
                            theArray[serializedElement.property] = serializedElement.value;
                        }else{
                            // Otherwise reference will be resolved later
                            this._unresolvedRefs.push({context: obj.value, property: serializedElement.property, refId: serializedElement.contextId});
                        }
                    }
                }

            })
        }
        

        if (firstTime){
            // First resolve the unresolved references
            this._unresolvedRefs.forEach((ref) => {
                let existingObject = this.getContextById(ref.refId);
                if (!existingObject)
                    throw new Error(`SHELL: Cannot resolve a reference for context Id: ${ref.refId}`);
                ref.context[ref.property] = existingObject;
            })
            // Remove the temporary flags from the objects
            this._seen.forEach((o) => {
                delete o[this._seenFlag];
            });

        }
        return node;
    }

    /**
     * Associates an Id with a context.
     * @param context Context owning the observable properties.
     * @param contextId An Id to associate with the context (auto-generated if not passed)
     * @param parentContextId The context Id of the parent context
     */
    public resolveId(context: Object, contextId: string = '', parentContextId: string = '', parentProperty: string = ''): string {
        // If the context is an array, check if it's been mapped to a proxy already
        // If so, get the proxy array and use that as the key
        if (context instanceof Array && this._arrayProxyMap.has(context)){
            context = this._arrayProxyMap.get(context) as any[]; 
        }
        // If the context is already mapped, then just return the existing contextId (and update parentContextIds)
        if (this._contextIdMap.has(context)) {
            let myContextId = this._contextIdMap.get(context) || '';
            if (context instanceof Array){
                let bindingMap = this._collectionBindingMap.get(myContextId)
                if (!bindingMap) {
                    throw new Error(`Missing binding map for array Id: ${myContextId}.`)
                }
                if (parentContextId){
                    let parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`
                    if (!bindingMap.parents.has(parentPropertyKey))
                        bindingMap.parents.add(parentPropertyKey);
                }

            }else{
                let bindingMap = this._contextBindingMap.get(myContextId)
                if (!bindingMap) {
                    throw new Error(`Missing binding map for context Id: ${myContextId}.`)
                }
                if (parentContextId){
                    let parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`
                    if (!bindingMap.parentContextIds.has(parentPropertyKey))
                        bindingMap.parentContextIds.add(parentPropertyKey);
                }
            }
            return contextId;
        }else{
            // Otherwise create a new Id (unless passed one) and binding mapping for the context
            if (!contextId)
                contextId = this._utilities.newGuid();
            this._contextIdMap.set(context, contextId);
            if (context instanceof Array){
                let bindingMap: ICollectionBindingMap = {
                    observer: null, 
                    parents: new Set()
                };
                if (parentContextId){
                    let parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`
                    if (!bindingMap.parents.has(parentPropertyKey))
                        bindingMap.parents.add(parentPropertyKey);
                }
                this._collectionBindingMap.set(contextId, bindingMap);

            }else{
                let bindingMap: IObjectBindingMap = {
                    observers: [], 
                    functions: [], 
                    parentContextIds: new Set<string>(), 
                    isRoot: !parentContextId 
                };
                if (parentContextId){
                    let parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`
                    if (!bindingMap.parentContextIds.has(parentPropertyKey))
                        bindingMap.parentContextIds.add(parentPropertyKey);
                }
                this._contextBindingMap.set(contextId, bindingMap);
            }
            return contextId;
        }
    }

    public observeProperty(context: Object, property: string, refIds: Set<string>, extensionId: string = "", parentContextId: string = ''): ISerializedObject | number | string | boolean | Symbol | null | undefined {
        // if it is the first property to be observed on the context, keep track of the context as being observed
        let contextId = this._contextIdMap.get(context);
        if (!contextId) {
            throw new Error("Missing context Id. The context Id must first be resolved before observing properties on the context.")
        }

        // make sure the property is not currently being observed
        let bindingMap = this._contextBindingMap.get(contextId)
        if (!bindingMap) {
            throw new Error(`Missing binding map for context Id: ${contextId}. The binding map must first be created before observing properties on the context.`)
        }
        let existingObserverIndex = bindingMap.observers.findIndex((i) => {
            return i.property() === property;
        });

        let propertyValue = context[property];

        if (existingObserverIndex === -1) {
            let observer = this._proxiedObservableFactory(contextId, context, property, extensionId);

            observer.observe();

            // keep track of the current observer            
            bindingMap.observers.push(observer);

            // If the property itself is an object or array, then recursively observe it
            if (propertyValue instanceof Array || this._utilities.isObject(propertyValue)){
                let metadata: ISerializedObject =  {
                    property: property,
                    contextId: '',
                    parentId: contextId,
                    value: null,
                    type: '',
                    childMetadata: [] 
                };
                this.observeObject(metadata, propertyValue, refIds, extensionId);
                return metadata;
            }
            // Dates are serialized as ISO strings
            if (propertyValue instanceof Date){
                let metadata: ISerializedObject =  {
                    property: property,
                    contextId: '',
                    parentId: contextId,
                    value: (propertyValue as Date).toISOString(),
                    type: SerializedType.Date,
                    childMetadata: [] 
                };
                return metadata;
            }
            return propertyValue;
        }else{
            return propertyValue;
        }
    }

    /**
     * Return a serialize object representation of the passed array, also populates the serializedArray property
     * of the passed metadata object
     * @param metadata Should have the appropriate property, contextId and parentId properties populated
     * @param array The array to begin observing for element changes
     * @param refIds Collection of context Ids that have been included in the current serialization/observation process
     * @param extensionId The Id of the extension this array belongs to
     */
    public observeCollection(metadata: ISerializedObject, collection: any[], refIds: Set<string>, extensionId: string = "",): void {
        if (!metadata || !metadata.contextId || !metadata.parentId)
            throw new Error('observeCollection: metadata is invalid or missing contextId or parentId values')
        if (!(collection instanceof Array))
            throw new Error('observeCollection: collection must be a valid array')

        metadata.type = SerializedType.Array;
        let serializedArray: any[] = [];

        // make sure the collection is not currently being observed
        let bindingMap = this._collectionBindingMap.get(metadata.contextId)
        if (!bindingMap) {
            throw new Error(`Missing collection binding map for context Id: ${metadata.contextId}. The binding map must first be created before observing changes in the collection.`)
        }

        if (!bindingMap.observer) {
            let observer = this._proxiedCollectionObservableFactory(metadata.contextId, collection, extensionId);
            observer.observe();
            bindingMap.observer = observer;

            // If any array elements are non-primitive, then we need to observe them 
            // This also means generating a new 'serialized' version of the array with
            // metadata objects taking the place of elements that are non-primitive 
            collection.forEach((element: any, index: number, array: any[]) => {
                if (this._utilities.isPrimitive(element)){
                    // If element is a primitive, copy directly to serialized array
                    serializedArray[index] = element;
                }else{
                    let elementMetadata: ISerializedObject =  {
                        property: index.toString(),
                        contextId: '',
                        parentId: metadata.contextId,
                        value: null,
                        type: SerializedType.Primitive,
                        childMetadata: [] 
                    };
                    if (element instanceof Date){
                        elementMetadata.type = SerializedType.Date;
                        elementMetadata.value = (element as Date).toISOString();
                    }
                    if (this._utilities.isObject(element) || element instanceof Array){
                        this.observeObject(elementMetadata, element, refIds, extensionId);
                    }
                    serializedArray[index] = elementMetadata
                }
            })
            metadata.value = serializedArray;
        }
    }

    /**
     * When an observed property is changed and the new property is an Object, this is called
     * from ProxiedObservable to ensure the new Object is being observed before syncing the 
     * new value and also to create a serialized version of the object
     * @param context 
     * @param extensionId 
     */
    public observeObject(metadata: ISerializedObject, context: Object, refIds: Set<string>, extensionId: string): ISerializedObject {
        if (this._utilities.isPrimitive(context))
            throw new Error('observeObject: context must be an object or array')

        if (!refIds)
            refIds = new Set<string>();
        if (!metadata){
            metadata =  {
                property: '',
                contextId: '',
                parentId: '',
                value: null,
                type: '',
                childMetadata: [] 
            };
        }

        // If the property object is already in the contextIdMap (and already in the passed refId set), 
        // then assume it's being observed, so we just need to pass the shared contextId key
        // The other window will lookup the property object based on the passed contextId key
        // and the refIds set should ensure only one copy is passed
        let existingContextId = this._contextIdMap.get(context);
        if (existingContextId && refIds.has(existingContextId)){
            metadata.contextId = existingContextId;
            metadata.type = this.getContextIdType(existingContextId);
        }else{
            let propertyContextId = this.resolveId(context, existingContextId, metadata.parentId, metadata.property);
            refIds.add(propertyContextId);
            metadata.contextId = propertyContextId;
            metadata.type = this.getContextIdType(propertyContextId);
            if (context instanceof Array){
                this.observeCollection(metadata as ISerializedObject, context as any[], refIds, extensionId);
            }
            if (this._utilities.isObject(context)){
                this._recursiveObserveObject(metadata, context, refIds, extensionId);
            }
        }
        return metadata;
    }

    /**
     * Iterate over all the properties in the passed object and begin observing them (if
     * they aren't already being observed).  The object is serialized into the passed metadata
     * object.  Primitive properties are added directly to the metadata.value object and 
     * complex properties (objects/arrays) are added as metadata to metadata.childMetadata
     * @param metadata 
     * @param context 
     * @param refIds 
     * @param extensionId 
     */
    private _recursiveObserveObject (metadata: ISerializedObject, context: Object, refIds: Set<string>, extensionId: string = ''): void {
        if (!metadata || !metadata.contextId) 
            throw new Error('recursiveObserve: metadata is invalid or missing contextId value')

        metadata.value = {};
        for (let prop in context) {
            // only register objects own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (context.hasOwnProperty(prop) &&
                !tapm.noObserve(context, prop) &&  // don't observe props with tapmNoObserve decorator
                !(context[prop] instanceof Map) && !(context[prop] instanceof Set) &&  // skip Maps and Sets for now
                prop.charAt(0) !== '_' &&
                this._utilities.classOf(context[prop]) !== '[object Function]'
            ) {
                let isPropertyArray = context[prop] instanceof Array;
                let childMetadata = this.observeProperty(context, prop, refIds, extensionId, metadata.parentId);

                // populate the metadata.value object with primitive properties
                // complex properties are added to metadata.childMetadata
                if (this._utilities.isPrimitive(childMetadata)){
                    metadata.value[prop] = childMetadata;
                }else{
                    metadata.childMetadata.push(childMetadata as ISerializedObject);
                }
            }
        }
    }

    private getContextIdType(contextId: string): string {
        let type = this._contextBindingMap.has(contextId) ? SerializedType.Object : (this._collectionBindingMap.has(contextId) ? SerializedType.Array : '');
        return type;
    }

    private getBindingMap(contextId: string): ICollectionBindingMap | IObjectBindingMap | undefined {
        let bindingMap = this._contextBindingMap.get(contextId)
        if (bindingMap)
            return bindingMap;

        let collectionBindingMap = this._collectionBindingMap.get(contextId);
        return collectionBindingMap;
    }

    private getBindingMapByContext(context: Object): ICollectionBindingMap | IObjectBindingMap | undefined {
        let contextId = this._contextIdMap.get(context);
        if (!contextId)
            return undefined;
        return this.getBindingMap(contextId);
    }

    public getContextById(contextId: string): Object | null {
        let existingObject: Object | null = null;
        this._contextIdMap.forEach((value, key) => {
            if (value === contextId)
                existingObject = key;
        })
        if (existingObject)
            return existingObject;
        return null;
    }

    public getIdByContext(context: Object): string | null {
        let existingContextId = this._contextIdMap.get(context);
        return existingContextId === void(0) ? null : existingContextId;
    }

    public unobserveBlade(context: Object): void {
        this.unobserve(context, '', '');
    }

    /**
     * Unobserve a specific context.
     * @param context 
     */
    public unobserve(context: Object, parentContextId: string, parentProperty: string, contextId: string = '', inRecursion: boolean = false): void {
        // if (!contextId){
        //     // get this context from the map
        //     let foundContextId = this._contextIdMap.get(context);
        //     if (!foundContextId) {
        //         throw new Error("Couldn't find context Id when unobserving context.")
        //     }
        //     contextId = foundContextId;
        // }

        // if (!inRecursion){
        //     this._seen = [];
        // }
 
        // // Verify that the context isn't being referenced by other parent objects
        // // before disposing of the observers
        // let bindingMap = this._contextBindingMap.get(contextId);
        // if (!bindingMap){
        //     throw new Error(`Couldn't find binding map when unobserving context: ${contextId}`)
        // }
        // // If parent of the context (and contexts can have zero, one or more parents) doesn't exist
        // // AND the context doesn't have any parent references (or has one parent reference, which we can
        // // assume is for the current call), then it's safe to unobserve
        // // OR
        // // If there is a parent of the context and it matches the passed parent and it's the only parent reference, 
        // // then it's safe to unobserve
        // let parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`
        // if ((!parentContextId && (bindingMap.isRoot || bindingMap.parentContextIds.size <= 1)) ||
        // (parentContextId && bindingMap.parentContextIds.has(parentPropertyKey) && bindingMap.parentContextIds.size === 1))
        // {
        //     // Must be an object, so add a temporary flag property to objects to prevent infinite loop from circular references
        //     context[this._seenFlag] = true;
        //     this._seen.push(context);

        //     // First recursively dispose of child objects
        //     // Search for child objects by finding all contexts which have a parent reference to the current context
        //     this._contextBindingMap.forEach((bindingMap, key) => {
        //         if (bindingMap.parentContextIds.has(contextId)){
        //             let childObject = this.getContextById(key);
        //             // If the child object has already been checked, skip it to prevent infinite loops
        //             if (childObject != null && !childObject.hasOwnProperty(this._seenFlag)){
        //                 this.unobserve(childObject, contextId as string, key, true);
        //             }
        //         }
        //     });

        //     ((bindingMap && bindingMap.observers) || []).forEach((proxiedObservable) => {
        //         proxiedObservable.dispose();
        //     });

        //     // remove the context from the map
        //     this._contextIdMap.delete(context);
        //     this._contextBindingMap.delete(contextId);
        // }

        // if (!inRecursion){
        //     // Remove the temporary flags from the objects
        //     this._seen.forEach((o) => {
        //         delete o[this._seenFlag];
        //     });
        // }
    }

    /**
     * Unobserve all contexts.
     */
    unobserveAll(): void {
        this._contextBindingMap.forEach((bindingMap, key) => {
            if (bindingMap.observers)
                bindingMap.observers.forEach((proxiedObservable) => proxiedObservable.dispose());
        });

        this._contextIdMap = new Map();
        this._contextBindingMap.clear();
    }
}

export default BindingEngine;
import { inject, Factory } from 'aurelia-dependency-injection';
import moment from 'moment';

import { ProxiedObservable } from './proxiedObservable';
import { ProxiedCollectionObservable, IArrayBindingSync, IArrayChangedSplice } from './proxiedCollectionObservable';

import * as tapm from '../metadata/metadata';
import { Utilities } from '../utilities/utilities';
import { RpcClient } from '../rpc/client';


/**
 * This defines the format of objects being serialized between windows
 */
export interface ISerializedObject{
    // Name of property or index of this data on a parent object or collection
    property: string;   
    // The GUID that identifies this data in the binding maps (not used for primitives)
    contextId: string;  
    // The GUID that identifies the object or collection that this data lives on
    parentId: string;   
    // For primitives, the actual value of the data
    // For dates, the ISO string value of the date
    // For collections, the collection where each element may be a primitive or another ISerializedObject
    // For objects, a plain object with all primitive properties, complex properties for the object are
    //      defined in the childMetadata array
    value: any;         
    // Defines the type of this data (see SerializedType for possible values)
    type: string;
    // If the data is an object with non-primitive properties, they require their metadata and that
    // is stored in this childMetadata array
    childMetadata: ISerializedObject[];
}

/**
 * Reference to an object that could not be currently resolved
 */
export interface IUnresolvedRef {
    context: object;
    property: string;
    refId: string;
}

interface IObjectBindingMap {
    // For a particular object, these are all the property observers
    observers: ProxiedObservable[];
    // Not currently used
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
    // For a particular collection, this is the collection observer that
    // watches for changes to the contents of the collection
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
    getIdByContext(context: object): string | null;
    resolveSerializedObject(obj: ISerializedObject, node?: object, firstTime?: boolean): object;
    observeObject(metadata: ISerializedObject, context: object, refIds: Set<string>, extensionId: string): ISerializedObject;
    unobserve(context: object, parentContextId: string, contextId?: string, inRecursion?: boolean): void; 
}

/**
 * Defines the valid types allowed on ISerializedObject
 */
export class SerializedType {
    public static readonly PRIMITIVE: string = 'p';
    public static readonly ARRAY: string = 'a';
    public static readonly OBJECT: string = 'o';
    public static readonly DATE: string = 'd';
    // Not currently used
    public static readonly SET: string = 's';
    // Not currently used
    public static readonly MAP: string = 'm';
}

@inject(Utilities, RpcClient, Factory.of(ProxiedObservable), Factory.of(ProxiedCollectionObservable))
export class BindingEngine implements IBindingEngine {
    constructor(
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _proxiedObservableFactory: (...args: any[]) => ProxiedObservable,
        private _proxiedCollectionObservableFactory: (...args: any[]) => ProxiedCollectionObservable
    ) {
        _rpc.subscribe('tapfx.propertyBindingSync', this._onPropertyBindingSync.bind(this));
        _rpc.subscribe('tapfx.arrayBindingSync', this._onArrayBindingSync.bind(this));
    }

    private _className: string = (this as object).constructor.name;
    private _contextIdMap: Map<object, string> = new Map();
    private _contextBindingMap: Map<string, IObjectBindingMap> = new Map();
    private _collectionBindingMap: Map<string, ICollectionBindingMap> = new Map();
    private _seen: object[] = [];
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
        console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Property binding sync.`, data);

        const bindingMap = this.getBindingMap(data.parentId);
        const observer = ((bindingMap && (bindingMap as IObjectBindingMap).observers) || []).find((i) => {
            return i.property() === data.property;
        });

        if (observer) {
            // If the old value was an object, dispose of any observers
            const context = this.getContextById(data.contextId);
            if (context && context[data.property] && this._utilities.isObject(context[data.property])) {
                const oldValueContext = context[data.property];
                const oldValueContextId = this.getIdByContext(oldValueContext);
                // If oldValue is an object mapped in the BindingEngine, then
                // dispose of any observers on it
                if (oldValueContextId) {
                    this.unobserve(oldValueContext, data.contextId,  data.property);
                }
            }
            // TODO if the old value was an array, dispose of any observers

             // If the new value is an object or array, recursively register it for observation
             if (!this._utilities.isPrimitive(data.value)) {
                // First check if it already exists in the context
                const existingChildObject = this.getContextById(data.contextId);
                if (existingChildObject) {
                    // If so, we assume it's being observed and assign that to the parent object
                    data.value = existingChildObject;
                }
                else {
                    switch (data.type.toLowerCase()){
                        case SerializedType.OBJECT:
                            let resolvedObject: object = {};
                            Object.assign(resolvedObject, data.value);
                            data.value = resolvedObject;
                            resolvedObject = this.resolveSerializedObject(data, resolvedObject, true);
                            // Then begin observing it (this handles observation of both objects and arrays)
                            // data.value is changed by observeObject, so don't use it after this
                            this.observeObject(data, resolvedObject, new Set<string>(), observer.extensionId);
                            data.value = resolvedObject;
                            break;
                        case SerializedType.ARRAY:
                            const resolvedArray: any[] = data.value as any[];
                            this.resolveSerializedObject(data, {}, true);
                            // data.value is changed by observeObject, so don't use it after this
                            this.observeObject(data, data.value, new Set<string>(), observer.extensionId);
                            data.value = resolvedArray;
                            break;
                        case SerializedType.DATE:
                            // Deserialize ISO date string to Date object
                            data.value = moment(data.value).toDate();
                            break;
                        default:
                            throw new Error('Invalid type supplied.');
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
        console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Array binding sync.`, data);
        const bindingMap = this._collectionBindingMap.get(data.contextId);
        if (!bindingMap || !bindingMap.observer) {
            console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Could not find collection binding map or observer for context Id "${data.contextId}"`);
            return;
        }

        const observer: ProxiedCollectionObservable = bindingMap.observer; 
        const addedMetadata: ISerializedObject[] = [];

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
            if (splice.addedCount && splice.added) {
                this._seen = [];
                this._unresolvedRefs = [];
                splice.added.forEach((element: any, index: number, theArray: any[]) => {
                    addedMetadata.push(element);
                    if (this._utilities.isPrimitive(element)) {
                        theArray[index] = element;
                    }
                    else {
                        const serializedObject: ISerializedObject = element;
                        // First check if it already exists in the context
                        const existingChildObject = this.getContextById(serializedObject.contextId);

                        if (existingChildObject) {
                            // If so, we assume it's being observed and assign that to the parent object
                            theArray[index] = existingChildObject;
                        }
                        else {
                            switch (serializedObject.type){
                                case SerializedType.ARRAY:
                                    let resolvedObject: object = {};
                                    Object.assign(resolvedObject, serializedObject);
                                    serializedObject.value = resolvedObject;
                                    resolvedObject = this.resolveSerializedObject(serializedObject, resolvedObject, false);
                                    theArray[index] = resolvedObject;
                                    break;
                                case SerializedType.OBJECT:
                                    theArray[index] = serializedObject.value;
                                    this.resolveSerializedObject(serializedObject, {}, false);
                                    break;
                                case SerializedType.DATE:
                                    theArray[index] = moment(serializedObject.value).toDate();
                                    break;
                                default:
                                    theArray[index] = serializedObject.value;
                                    break;
                            }
                        }
                    }
                });
            }
        });

        // Step 2
        // resolve the unresolved references
        this._unresolvedRefs.forEach((ref) => {
            const existingObject = this.getContextById(ref.refId);
            if (!existingObject) {
                throw new Error(`Cannot resolve a reference for context Id: ${ref.refId}`);
            }
            ref.context[ref.property] = existingObject;
        });

        // Remove the temporary flags from the objects
        this._seen.forEach((o) => {
            delete o[this._seenFlag];
        });

        // Step 3
        // Observe any new elements (if they're objects or arrays)
        data.splices.forEach((splice: IArrayChangedSplice) => {
            // Observe new elements that are arrays or object 
            if (splice.addedCount && splice.added) {
                splice.added.forEach((element: any, index: number, theArray: any[]) => {
                    if (!this._utilities.isPrimitive(element)) {
                        const metadata = addedMetadata[index];
                        if ([SerializedType.OBJECT, SerializedType.ARRAY].indexOf(metadata.type) >= 0) {
                            this.observeObject(metadata, element, new Set<string>(), observer.extensionId);
                        }
                    }
                });
            }

            // Update the parent array with the content changes
            observer.updateArray(splice, true);
        });
    }


    /**
     * Given a serialized object, this will
     * 1) add an entry to the contextIdMap and appropriate bindingMap (if not already mapped)
     * 2) for each property or element that is a serialized object, it will attempt to find
     *      that object in the contextIdMap based on the passed contextId or
     *      recursively invoke this function if a value for the property/element was passed or
     *      finally add the property/element to the list of unresolved references
     * 3) If specified, all unresolved references will attempt to be resolved at the top-level call
     * 4) An unserialized object/collection is returned that is basically the top-level serialized
     *      object with all properties/elements property resolved to values and no metadata properties
     *      included
     * @param obj The object that should be resolved
     * @param node The unserialized version of the object with no metadata properties
     * @param firstTime 
     */
    public resolveSerializedObject(obj: ISerializedObject, node: object = {}, firstTime: boolean = false): object {
        if (firstTime) {
            this._seen = [];
            this._unresolvedRefs = [];
        }
        
        // If this object has already been seen, don't dive in again
        if (obj.hasOwnProperty(this._seenFlag)) {
            return {};
        }

        obj[this._seenFlag] = true;
        this._seen.push(obj);

        // node is our deserialized object without extraneous properties from the passed data
        if (!firstTime) {
            node[obj.property] = obj.value;
        }
        // else
        //     node = obj.value;

        this.resolveId(obj.value, obj.contextId, obj.parentId, obj.property);

        // Recursively register any child objects first
        // For objects, they're in the childMetadata
        if (obj.type === SerializedType.OBJECT) {
            obj.childMetadata.forEach((metadata) => {
                // Check if there is already a mapped context with the passed Id
                const existingChildObject = this.getContextById(metadata.contextId);

                if (existingChildObject) {
                    // If so, we assume it's being observed and assign that to the parent object
                    // Updates node via object reference
                    (obj.value as object)[metadata.property] = existingChildObject;
                } 
                else {
                    if (metadata.value) {
                        switch (metadata.type) {
                            case SerializedType.OBJECT:
                            case SerializedType.ARRAY:
                                this.resolveSerializedObject(metadata);
                                break;
                            case SerializedType.DATE:
                                metadata.value = moment(metadata.value).toDate();
                                break;
                            default:
                                throw new Error('Invalid metadata type specified.');
                        }
                        // And reinstantiate on parent (updates node via object reference)
                        (obj.value as object)[metadata.property] = metadata.value;
                    } else {
                        // Otherwise reference will be resolved later
                        this._unresolvedRefs.push({context: obj.value, property: metadata.property, refId: metadata.contextId});
                    }
                }
            });
        }

        // For collections, they're in the value collection
        if (obj.type === SerializedType.ARRAY) {
            (obj.value as any[]).forEach((element: any, index: number, theArray: any[]) => {
                if (this._utilities.isPrimitive(element)) {
                    theArray[index] = element;
                }
                else {
                    const serializedElement = element as ISerializedObject;
                    // Check if there is already a mapped context with the passed Id
                    const existingChildObject = this.getContextById(serializedElement.contextId);
                    if (existingChildObject) {
                        // If so, we assume it's being observed and assign that to the parent object
                        // Updates node via array reference
                        theArray[serializedElement.property] = existingChildObject;
                    }
                    else {
                        if (serializedElement.value) {
                            switch (serializedElement.type) {
                                case SerializedType.OBJECT:
                                case SerializedType.ARRAY:
                                    this.resolveSerializedObject(serializedElement);
                                    break;
                                case SerializedType.DATE:
                                    serializedElement.value = moment(serializedElement.value).toDate();
                                    break;
                                default:
                                    throw new Error('Invalid element type specified.');
                            }
                            // And reinstantiate on parent (updates node via array reference)
                            theArray[serializedElement.property] = serializedElement.value;
                        }
                        else {
                            // Otherwise reference will be resolved later
                            this._unresolvedRefs.push({context: obj.value, property: serializedElement.property, refId: serializedElement.contextId});
                        }
                    }
                }
            });
        }
        

        if (firstTime) {
            // First resolve the unresolved references
            this._unresolvedRefs.forEach((ref) => {
                const existingObject = this.getContextById(ref.refId);
                if (!existingObject) {
                    throw new Error(`SHELL: Cannot resolve a reference for context Id: ${ref.refId}`);
                }
                ref.context[ref.property] = existingObject;
            });

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
     * @param parentContextId The context Id of the parent context, used to track object references for unobservation
     * @param parentProperty The index or property name on the parent context, used to track object references for unobservation
     */
    public resolveId(context: object, contextId: string = '', parentContextId: string = '', parentProperty: string = ''): string {
        // If the context is an array, check if it's been mapped to a proxy already
        // If so, get the proxy array and use that as the key
        if (context instanceof Array && this._arrayProxyMap.has(context)) {
            context = this._arrayProxyMap.get(context) as any[]; 
        }
        // If the context is already mapped, then just return the existing contextId (and update parentContextIds)
        if (this._contextIdMap.has(context)) {
            const myContextId = this._contextIdMap.get(context) || '';
            if (context instanceof Array) {
                const bindingMap = this._collectionBindingMap.get(myContextId);
                if (!bindingMap) {
                    throw new Error(`Missing binding map for array Id: ${myContextId}.`);
                }

                if (parentContextId) {
                    const parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`;
                    if (!bindingMap.parents.has(parentPropertyKey)) {
                        bindingMap.parents.add(parentPropertyKey);
                    }
                }

            }
            else {
                const bindingMap = this._contextBindingMap.get(myContextId);
                if (!bindingMap) {
                    throw new Error(`Missing binding map for context Id: ${myContextId}.`);
                }

                if (parentContextId) {
                    const parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`;
                    if (!bindingMap.parentContextIds.has(parentPropertyKey)) {
                        bindingMap.parentContextIds.add(parentPropertyKey);
                    }
                }
            }
            return contextId;
        }
        else {
            // Otherwise create a new Id (unless passed one) and binding mapping for the context
            if (!contextId) {
                contextId = this._utilities.newGuid();
            }
            this._contextIdMap.set(context, contextId);
            if (context instanceof Array) {
                const bindingMap: ICollectionBindingMap = {
                    observer: null, 
                    parents: new Set()
                };

                if (parentContextId) {
                    const parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`;
                    if (!bindingMap.parents.has(parentPropertyKey)) {
                        bindingMap.parents.add(parentPropertyKey);
                    }
                }

                this._collectionBindingMap.set(contextId, bindingMap);
            }
            else {
                const bindingMap: IObjectBindingMap = {
                    observers: [], 
                    functions: [], 
                    parentContextIds: new Set<string>(), 
                    isRoot: !parentContextId 
                };
                if (parentContextId) {
                    const parentPropertyKey = `${parentContextId},${parentProperty ? parentProperty : ''}`;
                    if (!bindingMap.parentContextIds.has(parentPropertyKey)) {
                        bindingMap.parentContextIds.add(parentPropertyKey);
                    }
                }
                this._contextBindingMap.set(contextId, bindingMap);
            }
            return contextId;
        }
    }

    /**
     * Add a ProxiedObservable to watch for changes to a specific property on an object
     * @param context 
     * @param property 
     * @param refIds 
     * @param extensionId 
     * @param parentContextId 
     */
    public observeProperty(context: object, property: string, refIds: Set<string>, extensionId: string = '', parentContextId: string = ''): ISerializedObject | number | string | boolean | symbol | null | undefined {
        // if it is the first property to be observed on the context, keep track of the context as being observed
        const contextId = this._contextIdMap.get(context);
        if (!contextId) {
            throw new Error('Missing context Id. The context Id must first be resolved before observing properties on the context.');
        }

        // make sure the property is not currently being observed
        const bindingMap = this._contextBindingMap.get(contextId);
        if (!bindingMap) {
            throw new Error(`Missing binding map for context Id: ${contextId}. The binding map must first be created before observing properties on the context.`);
        }

        const existingObserverIndex = bindingMap.observers.findIndex((i) => {
            return i.property() === property;
        });

        const propertyValue = context[property];

        if (existingObserverIndex === -1) {
            const observer = this._proxiedObservableFactory(contextId, context, property, extensionId);

            observer.observe();

            // keep track of the current observer            
            bindingMap.observers.push(observer);

            // If the property itself is an object or array, then recursively observe it
            if (propertyValue instanceof Array || this._utilities.isObject(propertyValue)) {
                const metadata: ISerializedObject =  {
                    property,
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
            if (propertyValue instanceof Date) {
                const metadata: ISerializedObject =  {
                    property,
                    contextId: '',
                    parentId: contextId,
                    value: (propertyValue as Date).toISOString(),
                    type: SerializedType.DATE,
                    childMetadata: [] 
                };
                return metadata;
            }
            return propertyValue;
        }
        else {
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
    public observeCollection(metadata: ISerializedObject, collection: any[], refIds: Set<string>, extensionId: string = ''): void {
        if (!metadata || !metadata.contextId || !metadata.parentId) {
            throw new Error('observeCollection: metadata is invalid or missing contextId or parentId values');
        }
        if (!(collection instanceof Array)) {
            throw new Error('observeCollection: collection must be a valid array');
        }

        metadata.type = SerializedType.ARRAY;
        const serializedArray: any[] = [];

        // make sure the collection is not currently being observed
        const bindingMap = this._collectionBindingMap.get(metadata.contextId);
        if (!bindingMap) {
            throw new Error(`Missing collection binding map for context Id: ${metadata.contextId}. The binding map must first be created before observing changes in the collection.`);
        }

        if (!bindingMap.observer) {
            const observer = this._proxiedCollectionObservableFactory(metadata.contextId, collection, extensionId);
            observer.observe();
            bindingMap.observer = observer;

            // If any array elements are non-primitive, then we need to observe them 
            // This also means generating a new 'serialized' version of the array with
            // metadata objects taking the place of elements that are non-primitive 
            collection.forEach((element: any, index: number, array: any[]) => {
                if (this._utilities.isPrimitive(element)) {
                    // If element is a primitive, copy directly to serialized array
                    serializedArray[index] = element;
                } 
                else {
                    const elementMetadata: ISerializedObject =  {
                        property: index.toString(),
                        contextId: '',
                        parentId: metadata.contextId,
                        value: null,
                        type: SerializedType.PRIMITIVE,
                        childMetadata: [] 
                    };

                    if (element instanceof Date) {
                        elementMetadata.type = SerializedType.DATE;
                        elementMetadata.value = (element as Date).toISOString();
                    }

                    if (this._utilities.isObject(element) || element instanceof Array) {
                        this.observeObject(elementMetadata, element, refIds, extensionId);
                    }

                    serializedArray[index] = elementMetadata;
                }
            });

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
    public observeObject(metadata: ISerializedObject, context: object, refIds: Set<string>, extensionId: string): ISerializedObject {
        if (this._utilities.isPrimitive(context)) {
            throw new Error('observeObject: context must be an object or array');
        }

        if (!refIds) {
            refIds = new Set<string>();
        }

        if (!metadata) {
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
        const existingContextId = this._contextIdMap.get(context);
        if (existingContextId && refIds.has(existingContextId)) {
            metadata.contextId = existingContextId;
            metadata.type = this.getContextIdType(existingContextId);
        }
        else {
            const propertyContextId = this.resolveId(context, existingContextId, metadata.parentId, metadata.property);
            
            refIds.add(propertyContextId);
            metadata.contextId = propertyContextId;
            metadata.type = this.getContextIdType(propertyContextId);

            if (context instanceof Array) {
                this.observeCollection(metadata as ISerializedObject, context as any[], refIds, extensionId);
            }

            if (this._utilities.isObject(context)) {
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
    private _recursiveObserveObject(metadata: ISerializedObject, context: object, refIds: Set<string>, extensionId: string = ''): void {
        if (!metadata || !metadata.contextId) {
            throw new Error('recursiveObserve: metadata is invalid or missing contextId value');
        }

        metadata.value = {};
        for (const prop in context) {
            // only register objects own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (context.hasOwnProperty(prop) &&
                !tapm.noObserve(context, prop) &&  // don't observe props with tapmNoObserve decorator
                !(context[prop] instanceof Map) && !(context[prop] instanceof Set) &&  // skip Maps and Sets for now
                prop.charAt(0) !== '_' &&
                this._utilities.classOf(context[prop]) !== '[object Function]'
            ) {
                const isPropertyArray = context[prop] instanceof Array;
                const childMetadata = this.observeProperty(context, prop, refIds, extensionId, metadata.parentId);

                // populate the metadata.value object with primitive properties
                // complex properties are added to metadata.childMetadata
                if (this._utilities.isPrimitive(childMetadata)) {
                    metadata.value[prop] = childMetadata;
                }
                else {
                    metadata.childMetadata.push(childMetadata as ISerializedObject);
                }
            }
        }
    }

    private getContextIdType(contextId: string): string {
        return this._contextBindingMap.has(contextId) ? SerializedType.OBJECT : (this._collectionBindingMap.has(contextId) ? SerializedType.ARRAY : '');
    }

    private getBindingMap(contextId: string): ICollectionBindingMap | IObjectBindingMap | undefined {
        const bindingMap = this._contextBindingMap.get(contextId);

        if (bindingMap) {
            return bindingMap;
        }

        const collectionBindingMap = this._collectionBindingMap.get(contextId);
        return collectionBindingMap;
    }

    private getBindingMapByContext(context: object): ICollectionBindingMap | IObjectBindingMap | undefined {
        const contextId = this._contextIdMap.get(context);
        
        if (!contextId) {
            return undefined;
        }

        return this.getBindingMap(contextId);
    }

    public getContextById(contextId: string): object | null {
        let existingObject: object | null = null;
        this._contextIdMap.forEach((value, key) => {
            if (value === contextId) {
                existingObject = key;
            }
        });
        
        if (existingObject) {
            return existingObject;
        }

        return null;
    }

    public getIdByContext(context: object): string | null {
        const existingContextId = this._contextIdMap.get(context);
        return existingContextId === void(0) ? null : existingContextId;
    }

    public unobserveBlade(context: object): void {
        this.unobserve(context, '', '');
    }

    /**
     * Unobserve a specific context.
     * @param context 
     */
    public unobserve(context: object, parentContextId: string, contextId: string = '', inRecursion: boolean = false): void {
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
    public unobserveAll(): void {
        this._contextBindingMap.forEach((bindingMap, key) => {
            if (bindingMap.observers) {
                bindingMap.observers.forEach((proxiedObservable) => proxiedObservable.dispose());
            }
        });

        this._contextIdMap = new Map();
        this._contextBindingMap.clear();
    }
}

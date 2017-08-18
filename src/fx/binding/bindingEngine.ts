import { inject, Factory } from 'aurelia-dependency-injection';
import moment from 'moment';

import { ProxiedObservable } from './proxiedObservable';
import { ProxiedCollectionObservable, IArrayBindingSync, IArrayChangedSplice, ISetBindingSync, ISetChangeRecord, IMapBindingSync, IMapChangeRecord } from './proxiedCollectionObservable';
import { BindingMap } from './bindingMap';
import { ChildReference, IChildReferenceConfig } from './childReference';
import { SerializedObject, ISerializedObjectConfig } from './serializedObject';
import { SerializedView, ISerializedViewConfig } from './serializedView';

import * as tapm from '../metadata/metadata';
import { BaseView } from '../ux/viewModels/viewModels.baseView';
import { Utilities } from '../utilities/utilities';
import { ViewParser } from '../ux/viewParser';
import { RpcClient, IRpcClientSubscription } from '../rpc/client';
import { DeferredPromise } from '../core/deferredPromise'; // TODO: add to tapFx object

/**
 * Reference to an object that could not be currently resolved
 */
interface IUnresolvedRef {
    context: object;
    property: string;
    refId: string;
}

/**
 * Defines the valid types allowed on ISerializedObject
 */
export class SerializedType {
    public static readonly PRIMITIVE: string = 'p';
    public static readonly ARRAY: string = 'a';
    public static readonly OBJECT: string = 'o';
    public static readonly DATE: string = 'd';
    public static readonly SET: string = 's';
    public static readonly MAP: string = 'm';
}

/**
 * Interface defining a function. Includes the name and the property descriptor.
 */
interface IFunction {
    funcName: string;
    funcDesc: PropertyDescriptor;
}

/**
 * Export the functions we want to make available to other parts of TAP-FX
 */
export interface IBindingEngine {
    getIdByContext(context: object): string | null;
    resolveSerializedObject(obj: SerializedObject, fixUnresolved?: boolean, extensionId?: string): object;
    observeObject(metadata: SerializedObject, context: object, refIds: Set<string>, extensionId: string, isMapKey?: boolean, isMapValue?: boolean, doViewKeySnapshot?: boolean): SerializedObject;
    unobserve(context: object, parentContextId: string, parentProperty: string, contextId?: string, isMapKey?: boolean, isMapValue?: boolean, onlyDoChildren?: boolean, inRecursion?: boolean ): void;
}

@inject(Utilities, RpcClient, ViewParser, Factory.of(ProxiedObservable), Factory.of(ProxiedCollectionObservable))
export class BindingEngine implements IBindingEngine {
    constructor(
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _viewParser: ViewParser,
        private _proxiedObservableFactory: (...args: any[]) => ProxiedObservable,
        private _proxiedCollectionObservableFactory: (...args: any[]) => ProxiedCollectionObservable
    ) {
        // Setup all the subscriptions for RPC messages when bound values change
        _rpc.subscribe('tapfx.propertyBindingSync', this._onPropertyBindingSync.bind(this));
        _rpc.subscribe('tapfx.arrayBindingSync', this._onArrayBindingSync.bind(this));
        _rpc.subscribe('tapfx.setBindingSync', this._onSetBindingSync.bind(this));
        _rpc.subscribe('tapfx.mapBindingSync', this._onMapBindingSync.bind(this));
    }

    private _className: string = (this as object).constructor.name;
    private _contextIdMap: Map<object, string> = new Map();
    private _contextBindingMap: Map<string, BindingMap> = new Map();
    private _seen: object[] = [];
    private _seenFlag: string = '$$__checked__$$';
    private _unresolvedRefs: IUnresolvedRef[] = [];
    private _contextsToDelete: any[] = [];
    private _contextIdsToDelete: string[] = [];
    private _viewMapKeysSnapshot: Set<string> = new Set<string>();

    /**
     * Handler for 'tapfx.propertyBindingSync' RPC messages 
     * 
     * @param data 
     */
    private _onPropertyBindingSync(data: SerializedObject): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Property binding sync.`, data);

        const bindingMap = this.getBindingMap(data.parentId);
        const observer = ((bindingMap && bindingMap.observers) || []).find((i) => {
            return i.property() === data.property;
        });

        if (observer) {
            // If the old value was an object, dispose of any observers
            const parentContext = this.getContextById(data.parentId);
            if (parentContext) { 
                const oldValue = parentContext[data.property];
                // If oldValue is an object mapped in the BindingEngine, then
                // dispose of any observers on it
                if (oldValue && this._contextIdMap.has(oldValue)) {
                    const oldValueContextId = this.getIdByContext(oldValue) as string;
                    this.unobserve(oldValue, data.parentId,  data.property, oldValueContextId, false, false, false, false);
                }
            }

            // First check if new value already exists in the context
            // If so, we assume it's being observed and assign that to the parent object
            let resolvedValue: any = this.getContextById(data.contextId);
            if (!resolvedValue) {
                // If the new value is an object or array, recursively register it for observation
                switch (data.type.toLowerCase()) {
                    case SerializedType.OBJECT:
                    case SerializedType.ARRAY:
                    case SerializedType.SET:
                    case SerializedType.MAP:
                        if (!this._contextBindingMap.has(data.contextId) && 
                            !this._utilities.isObject(data.value) &&
                            !this._utilities.isCollectionType(data.value)) {
                            throw new Error('onPropertyBindingSync: change record new value does not already exist in binding engine and no new value was passed.');
                        }
                        this.resolveSerializedObject(data, true, observer.extensionId);
                        // observeObject changes data.value to the serialized version, so save the resolved version now
                        resolvedValue = data.value;
                        this.observeObject(data, data.value, new Set<string>(), observer.extensionId, false, false);
                        break;
                    case SerializedType.DATE:
                        // Deserialize ISO date string to Date object
                        resolvedValue = moment(data.value).toDate();
                        break;
                    case SerializedType.PRIMITIVE:
                        resolvedValue = data.value;
                        break;
                    default:
                        throw new Error('Invalid type supplied.');
                }
            }

            observer.setValue(resolvedValue, true);
        }
    }
    
    /**
     * Handler for 'tapfx.arrayBindingSync' RPC messages 
     * @param data 
     */
    private _onArrayBindingSync(data: IArrayBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Array binding sync.`, data);
        const bindingMap = this._contextBindingMap.get(data.contextId);
        if (!bindingMap || !bindingMap.collectionObserver) {
            console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Could not find collection binding map or observer for context Id "${data.contextId}"`);
            return;
        }

        const observer: ProxiedCollectionObservable = bindingMap.collectionObserver; 
        const addedMetadata: SerializedObject[] = [];

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
            // For any elements that were removed, unobserve them
            const theArray = this.getContextById(data.contextId);
            if (theArray) {
                // removed array should be Array<number> at this point
                // but is defined as a Union with Array<object>
                splice.removed.forEach((index) => {
                    // If removed value is an object mapped in the BindingEngine, then
                    // dispose of any observers on it
                    const indexNumber: number = index as number;
                    const oldValue = theArray[indexNumber];
                    if (this._utilities.isObject(oldValue) || this._utilities.isCollectionType(oldValue)) {
                        const oldContextId = this.getIdByContext(oldValue);
                        if (oldContextId) {
                            this.unobserve(oldValue, data.contextId, indexNumber.toString(), oldContextId, false, false, false, false);
                        }
                    }
                });
            }
            // Resolve and reinstantiate any new elements
            if (splice.addedCount && splice.added) {
                this._seen = [];
                this._unresolvedRefs = [];
                splice.added.forEach((element: SerializedObject, index: number, addedArray: any[]) => {
                    addedMetadata.push(element);
                    // First check if it already exists in the context
                    // If so, we assume it's being observed and assign that to the parent object
                    addedArray[index] = this.getContextById(element.contextId);
                    if (!addedArray[index]) {
                        switch (element.type) {
                            case SerializedType.OBJECT:
                            case SerializedType.ARRAY:
                            case SerializedType.SET:
                            case SerializedType.MAP:
                                if (!this._contextBindingMap.has(element.contextId) && 
                                    !this._utilities.isObject(element.value) &&
                                    !this._utilities.isCollectionType(element.value)) {
                                    throw new Error('onArrayBindingSync: change record new value does not already exist in binding engine and no new value was passed.');
                                }
                                this.resolveSerializedObject(element, false, observer.extensionId);
                                addedArray[index] = element.value;
                                break;
                            case SerializedType.DATE:
                                addedArray[index] = moment(element.value).toDate();
                                break;
                            case SerializedType.PRIMITIVE:
                                addedArray[index] = element.value;
                                break;
                            default:
                                throw new Error('Invalid serialized object type.');
                        }
                    }
                });
            }
        });

        // Step 2
        // resolve the unresolved references
        this._fixUnresolvedReferences();

        // Step 3
        // Observe any new elements (if they're objects or collection)
        data.splices.forEach((splice: IArrayChangedSplice) => {
            if (splice.addedCount && splice.added) {
                splice.added.forEach((element: SerializedObject, index: number, theArray: any[]) => {
                    if (!this._utilities.isPrimitive(element.value)) {
                        const metadata = addedMetadata[index];
                        if ([SerializedType.OBJECT, SerializedType.ARRAY, SerializedType.SET, SerializedType.MAP].indexOf(metadata.type) >= 0) {
                            this.observeObject(metadata, element, new Set<string>(), observer.extensionId, false, false);
                        }
                    }
                });
            }

            // Update the parent array with the content changes
            observer.updateArray(splice, true);
        });
    }

    /**
     * Handler for 'tapfx.setBindingSync' RPC messages 
     * @param data 
     */
    private _onSetBindingSync(data: ISetBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Set binding sync.`, data);
        const bindingMap = this._contextBindingMap.get(data.contextId);
        if (!bindingMap || !bindingMap.collectionObserver) {
            console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Could not find collection binding map or observer for context Id "${data.contextId}"`);
            return;
        }

        const observer: ProxiedCollectionObservable = bindingMap.collectionObserver; 

        // resolve updated data
        // Because the sending side serialized the changes in order,
        // we should be able to resolve and observe each change in order without
        // running into unresolved references.
        this._seen = [];
        this._unresolvedRefs = [];
        data.changes.forEach((change: ISetChangeRecord, index: number, theArray: ISetChangeRecord[]) => {
            // Resolve and reinstantiate any new elements
            if (change.type === 'add') {
                if (!this._utilities.isPrimitive(change.value)) {
                    let resolvedValue: any = change.value;
                    const existingValueObject = this.getContextById(change.contextId as string);
                    if (existingValueObject) {
                        resolvedValue = existingValueObject;
                    } else {
                        const serializedObject = change.value as SerializedObject;
                        switch (serializedObject.type) {
                            case SerializedType.OBJECT:
                            case SerializedType.ARRAY:
                            case SerializedType.SET:
                            case SerializedType.MAP:
                                if (!this._contextBindingMap.has(serializedObject.contextId as string) && 
                                    !this._utilities.isObject(serializedObject.value) &&
                                    !this._utilities.isCollectionType(serializedObject.value)) {
                                    throw new Error('onSetBindingSync: change record new value does not already exist in binding engine and no new value was passed.');
                                }
                                this.resolveSerializedObject(serializedObject, true, observer.extensionId);
                                // observeObject changes data.value to the serialized version, so save the resolved version now
                                resolvedValue = serializedObject.value;
                                this.observeObject(serializedObject, serializedObject.value, new Set<string>(), observer.extensionId, false, false);
                                break;
                            case SerializedType.DATE:
                                resolvedValue = moment(serializedObject.value).toDate();
                                break;
                            case SerializedType.PRIMITIVE:
                                resolvedValue = serializedObject.value;
                                break;
                            default:
                                throw new Error('Invalid serialized object type.');
                        }
                    }
                    change.value = resolvedValue;
                }
            }
            if (change.type === 'delete') {
                // dispose of any observers on deleted elements
                if (change.contextId) {
                    const existingValueObject = this.getContextById(change.contextId);
                    if (existingValueObject) {
                        change.value = existingValueObject as any;
                        this.unobserve(existingValueObject, data.contextId, '', change.contextId, false, false, false, false);
                    }
                } else {
                    console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Set delete element sync messages must contain a context Id`);
                    return;
                }
            }

            if (change.type === 'clear') {
                // Set will be cleared by the updateSet statement below,
                // but first clean up all observers on it
                // Set onlyDoChildren parameter to true to do that
                const theSet = this.getContextById(data.contextId);
                if (theSet) {
                    this.unobserve(theSet, '', '', data.contextId, false, false, true, false);
                }
            }

            // Update the parent set with the content changes
            observer.updateSet(change, true);
        });
    }

    /**
     * Handler for 'tapfx.mapBindingSync' RPC messages 
     * @param data 
     */
    private _onMapBindingSync(data: IMapBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Map binding sync.`, data);
        const bindingMap = this._contextBindingMap.get(data.contextId);
        if (!bindingMap || !bindingMap.collectionObserver) {
            console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Could not find collection binding map or observer for context Id "${data.contextId}"`);
            return;
        }

        const observer: ProxiedCollectionObservable = bindingMap.collectionObserver; 

        // resolve updated data
        this._seen = [];
        this._unresolvedRefs = [];
        // Because the sending side serialized the changes in order (value then key for each change),
        // we should be able to resolve and observe each change in order (value then key) without
        // running into unresolved references.
        data.changes.forEach((change: IMapChangeRecord, index: number, theArray: any[]) => {

            // An element value changed, if the new value is non-primitive, resolve and observe it
            if (change.type === 'update' || change.type === 'add') {
                if (change.type === 'update' && change.oldValue) {
                    // If oldValue is an object mapped in the BindingEngine, then
                    // dispose of any observers on it (oldValue is the contextId of the old value)
                    const oldContext = this.getContextById(change.oldValue);
                    if (oldContext) {
                        this.unobserve(oldContext, data.contextId, '', change.oldValue, false, true, false, false);
                    }
                }

                if (!this._utilities.isPrimitive(change.value)) {
                    const serializedValue: SerializedObject = change.value;
                    let resolvedValue: any = change.value;
                    const existingValueObject = this.getContextById(serializedValue.contextId);
                    if (existingValueObject) {
                        resolvedValue = existingValueObject;
                    } else {
                        switch (serializedValue.type) {
                            case SerializedType.OBJECT:
                            case SerializedType.ARRAY:
                            case SerializedType.SET:
                            case SerializedType.MAP:
                                if (!this._contextBindingMap.has(serializedValue.contextId as string) && 
                                    !this._utilities.isObject(serializedValue.value) &&
                                    !this._utilities.isCollectionType(serializedValue.value)) {
                                    throw new Error('onMapBindingSync: change record new value does not already exist in binding engine and no new value was passed.');
                                }
                                this.resolveSerializedObject(serializedValue, true, observer.extensionId);
                                // observeObject changes data.value to the serialized version, so save the resolved version now
                                resolvedValue = serializedValue.value;
                                this.observeObject(serializedValue, serializedValue.value, new Set<string>(), observer.extensionId, false, true);
                                break;
                            case SerializedType.DATE:
                                resolvedValue = moment(serializedValue.value).toDate();
                                break;
                            case SerializedType.PRIMITIVE:
                                resolvedValue = serializedValue.value;
                                break;
                            default:
                                throw new Error('Invalid serialized value type.');
                        }
                    }
                    change.value = resolvedValue;
                }
            }

            // An element was added, so need to ensure both the new key and value are resolved 
            // and observed as necessary.  New values were handled in the case above, so just
            // handle new keys here
            if (change.type === 'add') {
                if (!this._utilities.isPrimitive(change.key)) {
                    const serializedKey: SerializedObject = change.key;
                    let resolvedKey: any = change.key;
                    // First check if it already exists in the context
                    const existingKeyObject = this.getContextById(serializedKey.contextId);
                    if (existingKeyObject) {
                        // If so, we assume it's being observed and assign that to the parent object
                        resolvedKey = existingKeyObject;
                    } else {
                        switch (serializedKey.type) {
                            case SerializedType.OBJECT:
                            case SerializedType.ARRAY:
                            case SerializedType.SET:
                            case SerializedType.MAP:
                                if (!this._contextBindingMap.has(serializedKey.contextId as string) && 
                                    !this._utilities.isObject(serializedKey.value) &&
                                    !this._utilities.isCollectionType(serializedKey.value)) {
                                    throw new Error('onMapBindingSync: change record new key does not already exist in binding engine and no new value was passed.');
                                }
                                this.resolveSerializedObject(serializedKey, true, observer.extensionId);
                                // observeObject changes data.value to the serialized version, so save the resolved version now
                                resolvedKey = serializedKey.value;
                                this.observeObject(serializedKey, serializedKey.value, new Set<string>(), observer.extensionId, true, false);
                                break;
                            case SerializedType.DATE:
                                change.key = moment(serializedKey.value).toDate();
                                break;
                            case SerializedType.PRIMITIVE:
                                resolvedKey = serializedKey.value;
                                break;
                            default:
                                throw new Error('Invalid serialized key type.');
                        }
                    }
                    change.key = resolvedKey;
                }
            }
            if (change.type === 'delete') {
                // If deleted key is an object mapped in the BindingEngine, then
                // dispose of any observers on it
                if (change.keyContextId) {
                    const existingKeyObject = this.getContextById(change.keyContextId);
                    if (existingKeyObject) {
                        change.key = existingKeyObject;
                        this.unobserve(existingKeyObject, data.contextId, '', change.keyContextId, true, false, false, false);
                    }
                }
                // If deleted value is an object mapped in the BindingEngine, then
                // dispose of any observers on it
                if (change.contextId) {
                    const existingValueObject = this.getContextById(change.contextId);
                    if (existingValueObject) {
                        change.value = existingValueObject;
                        this.unobserve(existingValueObject, data.contextId, '', change.contextId, false, true, false, false);
                    }
                }
            }
            if (change.type === 'clear') {
                // Map will be cleared by the updateMap statement below,
                // but first clean up all observers on it
                // Set onlyDoChildren parameter to true to do that
                const theMap = this.getContextById(data.contextId);
                if (theMap) {
                    this.unobserve(theMap, '', '', data.contextId, false, false, true, false);
                }
            }

            // Update the parent Map with the content changes
            observer.updateMap(change, true);
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
     * 4) The unserialized object/collection is returned the obj.value property 
     * @param obj The object that should be resolved
     * @param fixUnresolved 
     * @param extensionId 
     */
    public resolveSerializedObject(obj: SerializedObject, fixUnresolved: boolean = false, extensionId: string = ''): object {
        if (fixUnresolved) {
            this._seen = [];
            this._unresolvedRefs = [];
        }
        
        // If this object has already been seen, don't dive in again
        if (obj.hasOwnProperty(this._seenFlag)) {
            return {};
        }

        obj[this._seenFlag] = true;
        this._seen.push(obj);

        // Recursively register any child objects first
        // For objects, they're in the childMetadata
        if (obj.type === SerializedType.OBJECT) {
            this.resolveId(obj.value, obj.contextId, obj.parentId, obj.property);
            obj.childMetadata.forEach((metadata) => {
                // Check if there is already a mapped context with the passed Id
                const existingChildObject = this.getContextById(metadata.contextId);

                if (existingChildObject) {
                    // If so, we assume it's being observed and assign that to the parent object
                    (obj.value as object)[metadata.property] = existingChildObject;
                } else {
                    if (metadata.value) {
                        switch (metadata.type) {
                            case SerializedType.OBJECT:
                            case SerializedType.ARRAY:
                            case SerializedType.MAP:
                            case SerializedType.SET:
                                this.resolveSerializedObject(metadata, false, extensionId);
                                break;
                            case SerializedType.DATE:
                                metadata.value = moment(metadata.value).toDate();
                                break;
                            default:
                                throw new Error('Invalid metadata type specified.');
                        }
                        // And reinstantiate on parent 
                        (obj.value as object)[metadata.property] = metadata.value;
                    } else {
                        // Otherwise reference will be resolved later
                        this._unresolvedRefs.push({context: obj.value, property: metadata.property, refId: metadata.contextId});
                    }
                }
            });
            // If this is the portal, need to add serialized function proxies to the deserialized objects
            if (this._rpc.instanceId === 'all' && extensionId) {
                // Deserialized object should be obj.value
                this._registerPortalFunctions(obj, extensionId);
            }
        }

        // For Arrays, they're in the value collection
        if (obj.type === SerializedType.ARRAY) {
            this.resolveId(obj.value, obj.contextId, obj.parentId, obj.property);
            (obj.value as any[]).forEach((element: any, index: any, theCollection: any[]) => {
                if (!this._utilities.isPrimitive(element)) {
                    const serializedElement = element as SerializedObject;
                    // Check if there is already a mapped context with the passed Id
                    const existingChildObject = this.getContextById(serializedElement.contextId);
                    if (existingChildObject) {
                        // If so, we assume it's being observed and assign that to the parent object
                        theCollection[serializedElement.property] = existingChildObject;
                    } else {
                        if (serializedElement.value) {
                            switch (serializedElement.type) {
                                case SerializedType.OBJECT:
                                case SerializedType.ARRAY:
                                case SerializedType.MAP:
                                case SerializedType.SET:
                                    this.resolveSerializedObject(serializedElement, false, extensionId);
                                    break;
                                case SerializedType.DATE:
                                    serializedElement.value = moment(serializedElement.value).toDate();
                                    break;
                                default:
                                    throw new Error('Invalid serialized element type.');
                            }
                            // And reinstantiate on parent 
                            theCollection[serializedElement.property] = serializedElement.value;
                        } else {
                            // Otherwise reference will be resolved later
                            this._unresolvedRefs.push({context: obj.value, property: serializedElement.property, refId: serializedElement.contextId});
                        }
                    }
                }
            });
        }

        // For sets, they're in the value collection as an array, copy values to new Set
        if (obj.type === SerializedType.SET) {
            const collection: Set<any> = new Set<any>();
            this.resolveId(collection, obj.contextId, obj.parentId, obj.property);
            (obj.value as any[]).forEach((element: any) => {
                if (this._utilities.isPrimitive(element)) {
                    collection.add(element);
                } else {
                    const serializedElement = element as SerializedObject;
                    // Check if there is already a mapped context with the passed Id
                    const existingChildObject = this.getContextById(serializedElement.contextId);
                    if (existingChildObject) {
                        // If so, we assume it's being observed and assign that to the parent object
                        collection.add(existingChildObject);
                    } else {
                        if (serializedElement.value) {
                            switch (serializedElement.type) {
                                case SerializedType.OBJECT:
                                case SerializedType.ARRAY:
                                case SerializedType.MAP:
                                case SerializedType.SET:
                                    this.resolveSerializedObject(serializedElement, false, extensionId);
                                    break;
                                case SerializedType.DATE:
                                    serializedElement.value = moment(serializedElement.value).toDate();
                                    break;
                                default:
                                    throw new Error('Invalid element type specified.');
                            }
                            // And reinstantiate on parent 
                            collection.add(serializedElement.value);
                        } else {
                            // Otherwise reference will be resolved later
                            // Use a temp placeholder for any unresolved references, to keep the order of the Set intact
                            const tempId = this._utilities.newGuid();
                            collection.add(tempId);
                            this._unresolvedRefs.push({context: collection, property: tempId, refId: serializedElement.contextId});
                        }
                    }
                }
            });

            obj.value = collection;
        }

        // For Maps, values are in the value collection and keys are in the childData 
        if (obj.type === SerializedType.MAP) {
            const collection: Map<any, any> = new Map<any, any>();
            this.resolveId(collection, obj.contextId, obj.parentId, obj.property);
            let index: number = 0;
            let resolvedKey: any;
            (obj.value as any[]).forEach((element: any, key: any) => {

                // If the object is a Map, may need to resolve the key first
                if (this._utilities.isPrimitive(obj.childMetadata[index])) {
                    resolvedKey = obj.childMetadata[index];
                } else {
                    const serializedKey = obj.childMetadata[index] as SerializedObject;
                    // Check if there is already a mapped context with the passed Id
                    const existingKeyObject = this.getContextById(serializedKey.contextId);
                    if (existingKeyObject) {
                        // If so, we assume it's being observed and that's our key object
                        resolvedKey = existingKeyObject;
                    } else {
                        if (serializedKey.value) {
                            switch (serializedKey.type) {
                                case SerializedType.OBJECT:
                                case SerializedType.ARRAY:
                                case SerializedType.MAP:
                                case SerializedType.SET:
                                    this.resolveSerializedObject(serializedKey, false, extensionId);
                                    break;
                                case SerializedType.DATE:
                                    serializedKey.value = moment(serializedKey.value).toDate();
                                    break;
                                default:
                                    throw new Error('Invalid serialized key type.');
                            }
                            // Key has been resolved
                            resolvedKey = serializedKey.value;
                        } else {
                            // Otherwise reference will be resolved later
                            // Use a temp placeholder for any unresolved references, to keep the order of the Set intact
                            const tempId = this._utilities.newGuid();
                            resolvedKey = tempId;
                            this._unresolvedRefs.push({context: collection, property: tempId, refId: serializedKey.contextId});
                        }
                    }
                }

                if (this._utilities.isPrimitive(element)) {
                    collection.set(resolvedKey, element);
                } else {
                    const serializedElement = element as SerializedObject;
                    // Check if there is already a mapped context with the passed Id
                    const existingChildObject = this.getContextById(serializedElement.contextId);
                    if (existingChildObject) {
                        // If so, we assume it's being observed and assign that to the parent object
                        collection.set(resolvedKey, existingChildObject);
                    } else {
                        if (serializedElement.value) {
                            switch (serializedElement.type){
                                case SerializedType.OBJECT:
                                case SerializedType.ARRAY:
                                case SerializedType.MAP:
                                case SerializedType.SET:
                                    this.resolveSerializedObject(serializedElement, false, extensionId);
                                    break;
                                case SerializedType.DATE:
                                    serializedElement.value = moment(serializedElement.value).toDate();
                                    break;
                                default:
                                    throw new Error('Invalid serialized element value.');
                            }
                            // And reinstantiate on parent 
                            collection.set(resolvedKey, serializedElement.value);
                        } else {
                            // Otherwise reference will be resolved later
                            // Use a temp placeholder for any unresolved references, to keep the order of the Set intact
                            const tempId = this._utilities.newGuid();
                            this._unresolvedRefs.push({context: collection, property: tempId, refId: serializedElement.contextId});
                        }
                    }
                }
                index++;
            });

            obj.value = collection;
        }
        

        if (fixUnresolved) {
            this._fixUnresolvedReferences();
        }

        return obj.value;
    }

    /**
     * Iterates over the current collection of unresolved references and attempts to update the
     * reference with the resolved value
     * Sets and Maps don't have properties or indexes that can easily be accessed to update a reference,
     * so temporary placeholder GUID were inserted in them to know where to place the resolved
     * values, however it's a pain because we don't want to replace the Set with a new one (that'll screw
     * up observation and cause problems because all the parents with the Map/Set would need to be updated
     * to the new Map/Set), so the current set must be modified to update the reference. 
     */
    private _fixUnresolvedReferences(): void {
        // First resolve the unresolved references
        this._unresolvedRefs.forEach((ref) => {
            const existingObject = this.getContextById(ref.refId);
            if (!existingObject) {
                throw new Error(`SHELL: Cannot resolve a reference for context Id: ${ref.refId}`);
            }

            let resolved = false;
            if (ref.context instanceof Set) {
                // If the object is a Set, need to find placeholder
                const tempSet: Set<any> = new Set<any>();
                let found: boolean = false;
                // Copy all elements after and including placeholder
                ref.context.forEach((value: any) => {
                    if (value === ref.property) {
                        found = true;
                    }

                    if (found) {
                        tempSet.add(value);
                    }
                });
                // Delete all elements after and including placeholder
                tempSet.forEach((value: any) => {
                    (ref.context as Set<any>).delete(value);
                });
                tempSet.delete(ref.property);
                // Add resolved element
                (ref.context as Set<any>).add(existingObject);
                // Now copy back the rest of the Set elements after the placeholder
                tempSet.forEach((value: any) => {
                    (ref.context as Set<any>).add(value);
                });
                resolved = true;
            }

            if (ref.context instanceof Map) {
                // If the object is a Map, need to find placeholder (could be a key or value)
                const tempMap: Map<any, any> = new Map<any, any>();
                let foundKey: any = null;
                // Copy all elements after and including placeholder
                ref.context.forEach((value: any, key: any) => {
                    // If the placeholder was a value, it's an easy update
                    if (value === ref.property) {
                        (ref.context as Map<any, any>).set(key, existingObject);
                        resolved = true;
                    }

                    if (key === ref.property) {
                        foundKey = key;
                    }

                    if (foundKey) {
                        tempMap.set(key, value);
                    }
                });

                if (!resolved) {
                    // Delete all elements after and including placeholder
                    tempMap.forEach((value: any, key: any) => {
                        (ref.context as Map<any, any>).delete(key);
                    });
                    tempMap.delete(foundKey);
                    // Add resolved element
                    (ref.context as Map<any, any>).set(foundKey, existingObject);
                    // Now copy back the rest of the Map elements after the placeholder
                    tempMap.forEach((value: any, key: any) => {
                        (ref.context as Map<any, any>).set(key, value);
                    });
                    resolved = true;
                }
            }
            if (!resolved) {
                // Must be an object or array
                ref.context[ref.property] = existingObject;
            }
        });

        // Remove the temporary flags from the objects
        this._seen.forEach((o) => {
            delete o[this._seenFlag];
        });
    }

    /**
     * Associates an Id with a context and creates the appropriate binding map (for object or collection)
     * Also updates the collection of children references on the parent binding map
     * @param context Context owning the observable properties.
     * @param contextId An Id to associate with the context (auto-generated if not passed)
     * @param parentContextId The context Id of the parent context, used to track object references for unobservation
     * @param parentProperty The index or property name on the parent context, used to track object references for unobservation
     * @param isMapKey If the parent is a Map and the object is a map entry key, this should be true 
     * @param isMapValue If the parent is a Map and the object is a map entry value, this should be true 
     */
    public resolveId(
        context: object, 
        contextId: string = '', 
        parentContextId: string = '', 
        parentProperty: string = '',
        isMapKey: boolean = false,
        isMapValue: boolean = false): string {
        let bindingMap: BindingMap | undefined;
        // If the context is already mapped, then just return the existing contextId (and update parents)
        if (this._contextIdMap.has(context)) {
            const myContextId = this._contextIdMap.get(context) || '';
            bindingMap = this._contextBindingMap.get(myContextId);
            if (!bindingMap) {
                throw new Error(`Missing binding map for context Id: ${myContextId}.`);
            }
        } else {
            // Otherwise create a new Id (unless passed one) and binding mapping for the context
            if (!contextId) {
                contextId = this._utilities.newGuid();
            }
            this._contextIdMap.set(context, contextId);
            bindingMap = new BindingMap();
            bindingMap.type = this.getContextType(context);
            this._contextBindingMap.set(contextId, bindingMap);
        }

        // If there is a parent contextId and it's not the same as the object (a self-referencing object),
        // then update the references for use later when disposing of observers
        if (parentContextId && parentContextId !== contextId) {
            // Update the parent's bindingmap children references and 
            // the parent's reference for this object's binding map
            this.addChildToParentBindingMap(contextId, parentContextId, parentProperty, isMapKey, isMapValue);
            this.addParentToChildBindingMap(bindingMap, parentContextId, parentProperty, isMapKey, isMapValue);
        }

        return contextId;
    }

    /**
     * Update the parents map on the object binding map to include the passed parent info
     * @param contextBindingMap 
     * @param parentContextId 
     * @param parentProperty  This is either:
     *                          1) A property name if the parent is an object
     *                          2) An index if the parent is an array
     *                          3) not used if the parent is a Set or Map
     * @param isMapKey If the parent is a Map and the object is a map entry key, this should be true 
     * @param isMapValue If the parent is a Map and the object is a map entry value, this should be true 
     */
    private addParentToChildBindingMap(
        contextBindingMap: BindingMap,
        parentContextId: string, 
        parentProperty: string, 
        isMapKey: boolean = false,
        isMapValue: boolean = false) {

        const parentBindingMap = this.getBindingMap(parentContextId);
        if (parentBindingMap) {
            if (!contextBindingMap.parents.has(parentContextId)) {
                // No entry for the parent in the parents map, so add one
                const ref: ChildReference = new ChildReference();
                ref.type = this.getContextTypeById(parentContextId);
                switch (parentBindingMap.type) {
                    case SerializedType.OBJECT:
                    case SerializedType.ARRAY:
                        if (parentProperty) { 
                            ref.propertyIndex.add(parentProperty);
                        }
                        break;
                    case SerializedType.MAP:
                        ref.refCount = ref.refCount + (isMapValue ? 1 : 0),   // the number of times the object is a value in the entries
                        ref.isKey = isMapKey; // indicates the object is a key in the Map
                        break;
                    default:
                        break;
                }
                contextBindingMap.parents.set(parentContextId, ref);
            }else {
                // Otherwise update existing reference
                const ref = contextBindingMap.parents.get(parentContextId) as ChildReference;
                switch (parentBindingMap.type) {
                    case SerializedType.OBJECT:
                    case SerializedType.ARRAY:
                        if (parentProperty) { 
                            ref.propertyIndex.add(parentProperty);  // Collection of properties or indexes of object on parent
                        }
                        break;
                    case SerializedType.MAP:
                        ref.refCount = ref.refCount + (isMapValue ? 1 : 0),   // the number of times the object is a value in the entries
                        ref.isKey = isMapKey; // indicates the object is a key in the Map
                        break;
                    default:
                        break;
                }
                contextBindingMap.parents.set(parentContextId, ref); 
            }
        }
    }

    /**
     * Update the children map on the parent binding map to include the passed object info
     * @param contextId 
     * @param parentContextId 
     * @param parentProperty  This is either:
     *                          1) A property name if the parent is an object
     *                          2) An index if the parent is an array
     *                          3) not used if the parent is a Set or Map
     * @param isMapKey If the parent is a Map and the object is a map entry key, this should be true 
     * @param isMapValue If the parent is a Map and the object is a map entry value, this should be true 
     */
    private addChildToParentBindingMap(
        contextId: string, 
        parentContextId: string, 
        parentProperty: string, 
        isMapKey: boolean = false,
        isMapValue: boolean = false) {

        if (parentContextId) {
            const parentBindingMap = this.getBindingMap(parentContextId);
            if (parentBindingMap) {
                if (!parentBindingMap.children.has(contextId)) {
                    // No entry for the object in the children map, so add one
                    const ref: ChildReference = new ChildReference();
                    ref.type = this.getContextTypeById(contextId);
                    switch (parentBindingMap.type) {
                        case SerializedType.OBJECT:
                        case SerializedType.ARRAY:
                            if (parentProperty) { 
                                ref.propertyIndex.add(parentProperty);
                            }
                            break;
                        case SerializedType.MAP:
                            ref.refCount = ref.refCount + (isMapValue ? 1 : 0),   // the number of times the object is a value in the entries
                            ref.isKey = isMapKey; // indicates the object is a key in the Map
                            break;
                        default:
                            break;
                    }
                    parentBindingMap.children.set(contextId, ref);
                }else {
                    // Otherwise update existing reference
                    const ref = parentBindingMap.children.get(contextId) as ChildReference;
                    switch (parentBindingMap.type) {
                        case SerializedType.OBJECT:
                        case SerializedType.ARRAY:
                            if (parentProperty) { 
                                ref.propertyIndex.add(parentProperty);  // Collection of properties or indexes of object on parent
                            }
                            break;
                        case SerializedType.MAP:
                            ref.refCount = ref.refCount + (isMapValue ? 1 : 0),   // the number of times the object is a value in the entries
                            ref.isKey = isMapKey; // indicates the object is a key in the Map
                            break;
                        default:
                            break;
                    }
                    parentBindingMap.children.set(contextId, ref); 
                }
            }
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
    public observeProperty(context: object, property: string, refIds: Set<string>, extensionId: string = '', parentContextId: string = ''): SerializedObject | number | string | boolean | symbol | null | undefined {
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
            const observer = this._proxiedObservableFactory(contextId, context, property, extensionId, this);

            observer.observe();

            // keep track of the current observer            
            bindingMap.observers.push(observer);

            // If the property itself is a Date, Object or collection, then recursively observe it
            if (this._utilities.isDateObjectCollectionType(propertyValue)) {
                const metadata: SerializedObject = new SerializedObject();
                metadata.property = property;
                metadata.parentId = contextId;
                metadata.value = null;
                this.observeObject(metadata, propertyValue, refIds, extensionId, false, false);
                return metadata;
            }
        }
        return propertyValue;
    }

    /**
     * Return a serialize object representation of the passed array, also populates the serializedArray property
     * of the passed metadata object
     * Recursively resolves and observes elements in the collection and populates the metadata.value 
     * with the serialized version of the elements
     * @param metadata Should have the appropriate property, contextId and parentId properties populated
     * @param array The array to begin observing for element changes
     * @param refIds Collection of context Ids that have been included in the current serialization/observation process
     * @param extensionId The Id of the extension this array belongs to
     */
    public observeCollection(metadata: SerializedObject, collection: any[], refIds: Set<string>, extensionId: string = ''): void {
        if (!metadata || !metadata.contextId || !metadata.parentId) {
            throw new Error('observeCollection: metadata is invalid or missing contextId or parentId values');
        }

        if (!(this._utilities.isCollectionType(collection))) {
            throw new Error('observeCollection: collection must be a valid collection type');
        }

        metadata.type = this.getContextType(collection);

        const serializedArray: any[] = [];
        const mapKeyMetadata: any[] = [];

        // make sure the collection is not currently being observed
        const bindingMap = this._contextBindingMap.get(metadata.contextId);
        if (!bindingMap) {
            throw new Error(`Missing collection binding map for context Id: ${metadata.contextId}. The binding map must first be created before observing changes in the collection.`);
        }

        if (!bindingMap.collectionObserver) {
            // Observe the collection
            const observer = this._proxiedCollectionObservableFactory(metadata.contextId, collection, extensionId, this);
            observer.observe();
            bindingMap.collectionObserver = observer;

            // Now iterate over the collection elements
            // If any elements are non-primitive, then we need to observe them 
            // This also means generating a new 'serialized' version of the Collection with
            // metadata objects taking the place of elements that are non-primitive 
            let index: number = 0;
            collection.forEach((element: any, key: any, array: any[]) => {
                // If the collection is a Map, for each element ensure that both the key and value are observable/serializable,
                // otherwise skip
                if (!(collection instanceof Map && 
                    (!this._utilities.isPrimitive(element) && !this._utilities.isDateObjectCollectionType(element)) ||
                    (!this._utilities.isPrimitive(key) && !this._utilities.isDateObjectCollectionType(key)))) {

                    if (this._utilities.isPrimitive(element)) {
                        // If element is a primitive, copy directly to serialized array
                        serializedArray[index] = element;
                    } else {
                        // Only observe and serialize Date, Object and collection types
                        if (this._utilities.isDateObjectCollectionType(element)) {
                            const elementMetadata: SerializedObject = new SerializedObject();
                            elementMetadata.property = index.toString();
                            elementMetadata.parentId = metadata.contextId;
                            elementMetadata.type = SerializedType.PRIMITIVE;
                            elementMetadata.value = null;
                            this.observeObject(elementMetadata, element, refIds, extensionId, false, metadata.type === SerializedType.MAP);
                            serializedArray[index] = elementMetadata;
                        }
                    }
                    // If the collection is a Map, we need to also observe and serialize the keys
                    // The keys are stored in the childData array
                    if (collection instanceof Map) {
                        if (this._utilities.isPrimitive(key)) {
                            // If element is a primitive, copy directly to serialized array
                            mapKeyMetadata[index] = key;
                        } else {
                            // Only observe and serialize Date, Object and collection types
                            if (this._utilities.isDateObjectCollectionType(element)) {
                                const keyMetadata: SerializedObject = new SerializedObject();
                                keyMetadata.property = index.toString();
                                keyMetadata.parentId = metadata.contextId;
                                keyMetadata.type = SerializedType.PRIMITIVE;
                                keyMetadata.value = null;
                                if (key instanceof Date) {
                                    keyMetadata.type = SerializedType.DATE;
                                    keyMetadata.value = (key as Date).toISOString();
                                }
                                if (this._utilities.isObject(key) || this._utilities.isCollectionType(key)) {
                                    this.observeObject(keyMetadata, key, refIds, extensionId, true, false);
                                }
                                mapKeyMetadata[index] = keyMetadata;
                            }
                        }
                    }
                } 
                index++;
            });

            metadata.value = serializedArray;
            metadata.childMetadata = mapKeyMetadata;
        }
    }

    /**
     * When an observed property is changed and the new property is an Object, this is called
     * from ProxiedObservable to ensure the new Object is being observed before syncing the 
     * new value and also to create a serialized version of the object
     * @param metadata 
     * @param context 
     * @param refIds 
     * @param extensionId 
     * @param isMapKey If the parent is a Map and the object is a map entry key, this should be true 
     * @param isMapValue If the parent is a Map and the object is a map entry value, this should be true 
     * @param doViewKeySnapshot If true, it clears the 
     */
    public observeObject(
        metadata: SerializedObject, 
        context: object, 
        refIds: Set<string>, 
        extensionId: string,
        isMapKey: boolean = false,
        isMapValue: boolean = false,
        doViewKeySnapshot: boolean = false): SerializedObject {
        if (this._utilities.isPrimitive(context)) {
            throw new Error('observeObject: context must be an object or collection type');
        }

        if (!refIds) {
            refIds = new Set<string>();
        }

        if (!metadata) {
            metadata = new SerializedObject();
        }
        if (doViewKeySnapshot) {
            this._viewMapKeysSnapshot = this._viewParser.getParsedViewNames();
        }

        if (context instanceof Date) {
            metadata.type = SerializedType.DATE;
            metadata.value = (context as Date).toISOString();
        } else {
            // If the property object is already in the contextIdMap (and already in the passed refId set), 
            // then assume it's being observed, so we just need to pass the shared contextId key
            // The other window will lookup the property object based on the passed contextId key
            // and the refIds set should ensure only one copy is passed
            const existingContextId = this._contextIdMap.get(context);
            if (existingContextId && (doViewKeySnapshot || refIds.has(existingContextId))) {
                metadata.contextId = existingContextId;
                metadata.value = '';
                metadata.type = this.getContextTypeById(existingContextId);
                // Still want to update the parent's bindingmap children references and 
                // the parent's reference for this object's binding map, unless it's a 
                // self-referencing object
                if (metadata.parentId && metadata.parentId !== existingContextId) {
                    this.addChildToParentBindingMap(existingContextId, metadata.parentId, metadata.property, isMapKey, isMapValue);
                    const bindingMap = this._contextBindingMap.get(existingContextId);
                    if (bindingMap !== void(0)) {
                        this.addParentToChildBindingMap(bindingMap, metadata.parentId, metadata.property, isMapKey, isMapValue);
                    }
                }
            } else {
                metadata.type = this.getContextType(context);
                const propertyContextId = this.resolveId(context, existingContextId, metadata.parentId, metadata.property, isMapKey, isMapValue);
                
                refIds.add(propertyContextId);
                metadata.contextId = propertyContextId;

                if (this._utilities.isCollectionType(context)) {
                    this.observeCollection(metadata as SerializedObject, context as any[], refIds, extensionId);
                }

                if (this._utilities.isObject(context)) {
                    this._recursiveObserveObject(metadata, context, refIds, extensionId);
                }
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
    private _recursiveObserveObject(metadata: SerializedObject, context: object, refIds: Set<string>, extensionId: string = ''): void {
        if (!metadata || !metadata.contextId) {
            throw new Error('recursiveObserve: metadata is invalid or missing contextId value');
        }

        metadata.value = {};
        for (const prop in context) {
            // only register objects own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (context.hasOwnProperty(prop) &&
                !tapm.HasNoObserve(context, prop) &&  // don't observe props with NoObserve decorator
                prop.charAt(0) !== '_' &&
                (this._utilities.isPrimitive(context[prop]) || this._utilities.isDateObjectCollectionType(context[prop])) &&
                this._utilities.classOf(context[prop]) !== '[object Function]'
            ) {
                const childMetadata = this.observeProperty(context, prop, refIds, extensionId, metadata.parentId);

                // populate the metadata.value object with primitive properties
                // complex properties are added to metadata.childMetadata
                if (this._utilities.isPrimitive(childMetadata)) {
                    metadata.value[prop] = childMetadata;
                } else {
                    metadata.childMetadata.push(childMetadata as SerializedObject);
                }
            }
        }

        // If this is not the portal, then register the functions on the object and add them to the 
        // serialized object functions collection to recreate in the shell
        // Also, check if the context is a BaseView and parse the view content into HTML
        if (this._rpc.instanceId !== 'all') {
            this._registerExtensionFunctions(metadata,  context, extensionId);

            if (context instanceof BaseView) {
                const baseView = context as BaseView;

                if (baseView.content.length > 0) {
                    metadata.view = this._viewParser.parseViewToHTML(context, metadata.functions);
                }

                if (!this._utilities.isNullOrWhiteSpace(metadata.view)) {
                    if (!baseView.viewName) {
                        throw new Error('recursiveObserve: All BaseViews with a view must have a viewName defined');
                    }
                    metadata.viewName = baseView.viewName;
                }
            }
        } 
    }

    /**
     * Register serialized function proxies on a deserialized object in the portal
     * @param obj 
     * @param extensionId 
     */
    private _registerPortalFunctions(obj: SerializedObject, extensionId: string): void {
        if (obj.functions && obj.functions.length > 0) { 
            const bindingMap = this._contextBindingMap.get(obj.contextId);
            if (bindingMap) {
                console.log('[SHELL] Attaching blade functions: ', obj.functions);
                // loop through all the passed functions and add them as a function to the serialized blade which will publish a message with the function data
                for (const func of obj.functions) {
                obj.value[func] = (): Promise<{}> => {
                        // publish the function call to the extension
                        console.log(`[SHELL] Publishing message from function: ${func}`);
                        this._rpc.publish(`tapfx.${obj.contextId}.${func}`, extensionId, { functionArgs: Array.from(arguments)/*[...arguments]*/ });
                        
                        // set up a subscription for any result from the calling of the function in the extension
                        const resultPromise = new DeferredPromise();
                        const subscription = this._rpc.subscribe(`shell.${obj.contextId}.${func}`, (data) => {
                            console.log(`[SHELL] Receiving result from function: ${func},  result: `, data);
                            resultPromise.resolve(data);

                            // unsubscribe from the result subscription
                            subscription.unsubscribe();
                        });

                        return resultPromise.promise.then(result => result);
                    };
                }
            }
        }
    }

    /**
     * Register an observed object's functions as subscriptions so that they can be called from the shell over the RPC.
     * @param metadata 
     * @param context 
     * @param extensionId 
     */
    private _registerExtensionFunctions(metadata: SerializedObject, context: object, extensionId: string): void {
        const bindingMap = this._contextBindingMap.get(metadata.contextId);
        if (bindingMap) {
            const subscriptionArray: IRpcClientSubscription[] = [];
            const returnFuncs: string[] = [];

            // get the serializable functions on the object 
            const objectFuncs = this._getObjectFunctions(context);
            for (const func of objectFuncs) {
                const funcName = func.funcName;
                // add a subscription which will call the object's original function with the passed function args
                const subscription: IRpcClientSubscription = this._rpc.subscribe(`tapfx.${metadata.contextId}.${funcName}`, (data) => {
                    // call the function and get the result
                    console.log(`[TAP-FX][${this._rpc.instanceId}] Received message from context ${metadata.contextId} for function: ${funcName}`);
                    let result: any = null;
                    if (context[funcName]) {
                        result = context[funcName](...data.functionArgs);
                    } else {
                        console.warn(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Could not find function ${funcName} on object with context Id ${metadata.contextId}`);
                    }

                    // publish the result back to the shell
                    console.log(`[TAP-FX][${this._rpc.instanceId}] Publishing result from context ${metadata.contextId} from function: ${funcName}`);
                    this._rpc.publish(`shell.${metadata.contextId}.${funcName}`, '', result);
                });
                bindingMap.functionSubscriptions.push(subscription);
                metadata.functions.push(funcName);
            }

            if (!metadata.parentId) {
                // convention - add a subscription for the onRemoveClick which calls the _removeBladeRange function
                const funcName = 'onRemoveClick';
                metadata.functions.push(funcName);
            }
        }
    }

    /**
     * Get an array of function information for an object.
     * @param blade 
     */
    private _getObjectFunctions(obj: object): IFunction[] {
        // get the proto of the object and then the functions from that,
        // but don't include functions inherited from the generic object
        const objectProto = Object.getPrototypeOf(obj);
        const objectFuncs = this._utilities.getOwnObjectFunctions(objectProto);

        // for now, don't sync the activation lifecycle functions over
        const funcIgnoreArray = ['constructor', 'activate', 'canActivate', 'deactivate', 'canDeactivate'];

        const funcs: IFunction[] = [];
        // now lets map that to an array of function information
        objectFuncs.forEach((funcName: string) => {
            const funcDesc: PropertyDescriptor = Object.getOwnPropertyDescriptor(objectProto, funcName);

            // ignore private functions beginning with _, similar to property observing
            // for now, we will use a function ignore array to ignore functions we don't want to listen for (like 'constructor')
            // TODO: determine how to attach get and set functions
            if (funcName.charAt(0) !== '_' &&
                !tapm.HasNoSync(obj, funcName) &&  // don't include functions with NoSync decorator
                funcIgnoreArray.indexOf(funcName) === -1/* &&
                funcDesc.get === undefined*/) {
                    funcs.push({ funcName, funcDesc});
                }
        });

        return funcs;
    }



    private getContextTypeById(contextId: string): string {
        const context = this.getContextById(contextId);
        return this.getContextType(context);
    }
    private getContextType(context: any): string {
        if (context instanceof Set) {
            return SerializedType.SET;
        }
        if (context instanceof Map) {
            return SerializedType.MAP;
        }
        if (context instanceof Array) {
            return SerializedType.ARRAY;
        }
        return SerializedType.OBJECT;
    }

    private getBindingMap(contextId: string): BindingMap | undefined {
        const bindingMap = this._contextBindingMap.get(contextId);
        return bindingMap;
    }

    private getBindingMapByContext(context: object): BindingMap | undefined {
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

    /**
     * Get the new parsed views (and viewnames) since this._viewMapKeysSnapshot was last set
     */
    public getNewParsedViews():  SerializedView[] {
        const results: SerializedView[] = [];
        this._viewParser.parsedViewMap.forEach((value: string, key: string) => {
            if (!this._viewMapKeysSnapshot.has(key)) {
                results.push(new SerializedView({viewName: key, view: value}));
            }
        });
        return results;
    }

    /**
     * Dispose of all observers on the blade object and it's hierarchy
     * and clean them out of the binding mappings if possible
     * @param context The blade object
     */
    public unobserveBlade(context: object): void {
        this.unobserve(context, '', '');
    }

    /**
     * Unobserve a specific context.
     * @param context 
     * @param parentContextId 
     * @param parentProperty 
     * @param contextId 
     * @param [isMapKey=false] If the parent is a Map and the context being unobserved is a map entry key, this should be true 
     * @param [isMapValue=false] If the parent is a Map and the context being unobserved is a map entry value, this should be true 
     * @param [onlyDoChildren=false] If true, the passed context isn't unobserved, just any children objects on it
     * @param [inRecursion=false]
     */
    public unobserve(
        context: object, 
        parentContextId: string, 
        parentProperty: string, 
        contextId: string = '',
        isMapKey: boolean = false, 
        isMapValue: boolean = false,
        onlyDoChildren: boolean = false,
        inRecursion: boolean = false): void {
        if (!contextId) {
            // get this context from the map
            const foundContextId = this.getIdByContext(context);
            if (!foundContextId) {
                console.warn("Couldn't find context Id when unobserving context.");
                return;
            }
            contextId = foundContextId;
        }

        if (!inRecursion) {
            this._seen = [];
        }

        // Verify that the context isn't being referenced by other parent objects
        // before disposing of the observer
        const bindingMap = this.getBindingMap(contextId);
        if (!bindingMap) {
            console.warn(`Couldn't find binding map when unobserving context: ${contextId}`);
            return;
        }

        // Remove this object from the parent's collection of children objects
        this.removeChildFromParentBindingMap(contextId, parentContextId, parentProperty, isMapKey, isMapValue);

        // If the child object has already been checked, skip it to prevent infinite loops
        if (context.hasOwnProperty(this._seenFlag)) {
            return;
        }

        let isOnlyParent: boolean = false;
        // If passed parent context Id and parent property, verify that it's in the list of parent references 
        // for the context and it's the only parent reference
        // The object's collection of parent objects is also updated at this point
        if (parentContextId && bindingMap.parents.has(parentContextId)) {
            const parentReference = bindingMap.parents.get(parentContextId) as ChildReference;
            const parentBindingMap = this.getBindingMap(parentContextId);
            switch (parentReference.type){
                case SerializedType.OBJECT:
                case SerializedType.ARRAY:
                    if (parentReference.propertyIndex.has(parentProperty)) {
                        if (parentReference.propertyIndex.size === 1) {
                            isOnlyParent = bindingMap.parents.size === 1;
                            bindingMap.parents.delete(parentContextId);
                        } else {
                            parentReference.propertyIndex.delete(parentProperty);
                        }
                    } 
                    break;
                case SerializedType.SET:
                    isOnlyParent = bindingMap.parents.size === 1;
                    bindingMap.parents.delete(parentContextId);
                    break;
                case SerializedType.MAP:
                    // unobserving keys and values on Maps is trickier because there 
                    // is no property name or index to reference, so we just assume
                    // any one map key could be the context and zero or more map values
                    // could be the context, but it should be at least a key or value
                    // to ever get to this point
                    switch (true){
                        case isMapKey && isMapValue:
                            if (parentReference.isKey && parentReference.refCount > 0) {
                                if (parentReference.refCount === 1) {
                                    isOnlyParent = bindingMap.parents.size === 1;
                                    bindingMap.parents.delete(parentContextId);
                                } else {
                                    parentReference.isKey = false;
                                    parentReference.refCount = parentReference.refCount - 1;
                                }
                            } else {
                                console.warn(`If isMapKey and isMapValue are both true, then the matching parent refernce must have isKey = true and refCount > 0 for context: ${contextId}`);
                                return;
                            }
                            break;
                        case isMapKey && !isMapValue:
                            if (parentReference.isKey) {
                                if (parentReference.refCount === 0) {
                                    isOnlyParent = bindingMap.parents.size === 1;
                                    bindingMap.parents.delete(parentContextId);
                                } else {
                                    parentReference.isKey = false;
                                }
                            } else {
                                console.warn(`If isMapKey is true, then the matching parent refernce must have isKey = true for context: ${contextId}`);
                                return;
                            }
                            break;
                        case !isMapKey && isMapValue:
                            if (parentReference.refCount > 0) {
                                if (parentReference.refCount === 1 && !parentReference.isKey) {
                                    isOnlyParent = bindingMap.parents.size === 1;
                                    bindingMap.parents.delete(parentContextId);
                                } else {
                                    parentReference.refCount = parentReference.refCount - 1;
                                }
                            } else {
                                console.warn(`If isMapKey is true, then the matching parent refernce must have isKey = true for context: ${contextId}`);
                                return;
                            }
                            break;
                        case !isMapKey && !isMapValue:
                            console.warn(`Map content cannot be unobserved unless isMapKey or IsMapValue is true for context: ${contextId}`);
                            return;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }

        // If this object doesn't have anymore parents, then it's safe to remove 
        // from the binding mappings
        if (bindingMap.parents.size === 0 && (inRecursion || !onlyDoChildren)) {
            this._contextIdsToDelete.push(contextId);
            this._contextsToDelete.push(context);
        }

        // If parent of the context (Note: contexts can have zero, one or more parents) doesn't exist
        // AND the context doesn't have any parent references, then it's safe to dispose of observer 
        // OR
        // If there is a parent of the context and it matches the passed parent/property and it's the only parent reference, 
        // then it's safe to dispose of observer 
        if ((!parentContextId && bindingMap.parents.size === 0) || isOnlyParent || onlyDoChildren) {
            // Must be an object/collection, so add a temporary flag property to 
            // it to prevent infinite loop from circular references
            context[this._seenFlag] = true;
            this._seen.push(context);

            // First recursively dispose of child objects and collections
            bindingMap.children.forEach((child: ChildReference, childId: string, theMap: Map<string, ChildReference>) => {
                const childContext = this.getContextById(childId);
                if (childContext) {
                    switch (bindingMap.type) {
                        case SerializedType.OBJECT:
                        case SerializedType.ARRAY:
                            // If child object is referenced by multiple properties or indexes, try
                            // to unobserve all of them.  Only last reference will actually dispose
                            // of the child object and then only if no other parents reference it
                            (child.propertyIndex || []).forEach((propertyIndex: string) => {
                                this.unobserve(childContext, contextId, propertyIndex, childId, false, false, false, true);
                            });
                            break;
                        case SerializedType.SET:
                            this.unobserve(childContext, contextId, '', childId, false, false, false, true);
                            break;
                        case SerializedType.MAP:
                            // Unobserve the child for every key and value that references it in the Map
                            if (child.isKey) {
                                this.unobserve(childContext, contextId, '', childId, true, false, false, true);
                            }
                            for (let i = 0; i < child.refCount; i++) {
                                this.unobserve(childContext, contextId, '', childId, false, true, false, true);
                            }
                            break;
                        default:
                            break;
                    }
                    theMap.delete(childId);
                }
            });

            // Dispose of all the observers for the context
            if (inRecursion || !onlyDoChildren) {
                ((bindingMap && bindingMap.observers) || []).forEach((proxiedObservable) => {
                    proxiedObservable.dispose();
                });
                if (bindingMap.collectionObserver) {
                    bindingMap.collectionObserver.dispose();
                }
            }
        }

        if (!inRecursion) {
            // Remove the temporary flags from the objects
            this._seen.forEach((o) => {
                delete o[this._seenFlag];
            });
            // remove the context and bindingmap
            (this._contextsToDelete || []).forEach((contextToDelete: any) => {
                this._contextIdMap.delete(contextToDelete);
            });
            (this._contextIdsToDelete || []).forEach((contextIdToDelete: any) => {
                this._contextBindingMap.delete(contextIdToDelete);
            });
            this._contextIdsToDelete = [];
            this._contextsToDelete = [];
        }
    }



    /**
     * Update the children map on the parent binding map to remove the passed object info
     * @param contextId 
     * @param parentContextId 
     * @param parentProperty  This is either:
     *                          1) A property name if the parent is an object
     *                          2) An index if the parent is an array
     *                          3) not used if the parent is a Set or Map
     * @param isMapKey If the parent is a Map and the object is a map entry key, this should be true 
     * @param isMapValue If the parent is a Map and the object is a map entry value, this should be true 
     */
    private removeChildFromParentBindingMap(
        contextId: string, 
        parentContextId: string, 
        parentProperty: string, 
        isMapKey: boolean = false,
        isMapValue: boolean = false) {

        if (parentContextId) {
            const parentBindingMap = this.getBindingMap(parentContextId);
            if (parentBindingMap) {
                if (parentBindingMap.children.has(contextId)) {
                    // update existing reference or delete it if there are no more
                    // references to the child on the object
                    const ref = parentBindingMap.children.get(contextId) as ChildReference;
                    switch (parentBindingMap.type) {
                        case SerializedType.OBJECT:
                        case SerializedType.ARRAY:
                            if (parentProperty) { 
                                if (ref.propertyIndex.has(parentProperty)) {
                                    ref.propertyIndex.delete(parentProperty);
                                    if (ref.propertyIndex.size === 0) {
                                        parentBindingMap.children.delete(contextId);
                                    }
                                }
                            }
                            break;
                        case SerializedType.MAP:
                            if (isMapKey) {
                                ref.isKey = false;
                            }
                            if (isMapValue) {
                                ref.refCount = ref.refCount - 1;
                            }
                            if (!ref.isKey && ref.refCount === 0) {
                                parentBindingMap.children.delete(contextId);
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    /**
     * Unobserve all contexts.
     * No need to worry about checking parent and children references, just dispose of all
     * observers and clear out the mappings
     */
    public unobserveAll(): void {
        this._contextBindingMap.forEach((bindingMap, key) => {
            (bindingMap.observers || []).forEach((proxiedObservable) => proxiedObservable.dispose());
            if (bindingMap.collectionObserver) {
                bindingMap.collectionObserver.dispose();
            }
        });

        this._contextIdMap.clear();
        this._contextBindingMap.clear();
    }
}

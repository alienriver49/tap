/// <reference path="./../../typings.d.ts" />
import { inject } from 'aurelia-dependency-injection'
import { ObserverLocator} from 'aurelia-binding';
import { TaskQueue } from 'aurelia-task-queue';
import RpcClient from './../rpc/client'
import Utilities from './../utilities/utilities'
import {getTapFx} from 'tap-fx'
import {IBindingEngine, ISerializedObject} from './bindingEngine'
import { InternalPropertyObserver, InternalCollectionObserver} from 'aurelia-binding'; // type

// first three properties are defined by Aurelia, last by us
// Note that these are not explicitly defined in any aurelia public interface,
// but were found via the source code, so may change in the future
export interface IArrayChangedSplice {
    addedCount: number, 
    index: number, 
    removed: Object[],
    added?: ISerializedObject[]
};

/**
 * When sending an RPC message to update the contents of a synced collection, this will
 * be the data cargo
 */
export interface IArrayBindingSync {
    contextId: string,
    splices: IArrayChangedSplice[],
}

/**
 * This is based on the change record format create in 
 * https://github.com/aurelia/binding/blob/master/src/set-observation.js 
 */
export interface ISetChangeRecord {
    type: string;
    value: any
    contextId?: string; // tapfx specific property
}

export interface ISetBindingSync {
    contextId: string,
    changes: ISetChangeRecord[],
}

/**
 * This is based on the change record formats created in
 * https://github.com/aurelia/binding/blob/master/src/map-observation.js
 */
export interface IMapChangeRecord {
    type: string;
    key: any;
    oldValue: any;
    value: any;          // tapfx specific property
    contextId?: string;  // tapfx specific property
    keyContextId?: string;  // tapfx specific property
}

export interface IMapBindingSync {
    contextId: string,
    changes: IMapChangeRecord[],
}

/**
 * Built on the Aurelia ObserverLocator module, this class will watch
 * if any elements in a collection change via array methods calls
 * It currently does not watch for changes via array indexes (like a[2] = 'foo') 
 * Any changes will trigger an RPC call to sync the changes to the other window
 */
@inject(ObserverLocator, RpcClient, Utilities)
export class ProxiedCollectionObservable {
    constructor(
        private _observerLocator: ObserverLocator,
        private _rpc: RpcClient,
        private _utilities: Utilities,
        private _contextId: string,
        private _collection: any[] | Set<any> | Map<any, any>,
        private _extensionId: string,
    ) { 
    }

    private _collectionObserver: InternalCollectionObserver;
    private _className: string = (this as Object).constructor.name;
    private _boundArrayChanged = this._arrayChanged.bind(this) as (splices: any) => void;
    private _boundSetChanged = this._setChanged.bind(this) as (change: any) => void;
    private _boundMapChanged = this._mapChanged.bind(this) as (change: any) => void;
    private _canObserveCollection: boolean = true;
    private _bindingEngine: IBindingEngine;

    public get extensionId(){
        return this._extensionId;
    }

    // Using the BindingEngine in this class does introduce some circular dependencies, but they should be ok because
    // a ProxiedObservable will only be created (injected) by the BindingEngine, but the BindingEngine isn't DI'ed into
    // the ProxiedObservable and won't be used in the ProxiedObservable until this _propertyChanged function is called, 
    // so we can be assured that the BindingEngine is available at this point
    private get bindingEngine(){
        if (!this._bindingEngine)
            this._bindingEngine = getTapFx().BindingEngine; 
        return this._bindingEngine;
    }

    /**
     * Array contents have changed.  splices objects have most of the data we need 
     * to sync, but for additions we need to pass the actual added elements
     * https://ilikekillnerds.com/2015/10/observing-objects-and-arrays-in-aurelia/
     * @param splices 
     */
    private _arrayChanged(splices: IArrayChangedSplice[]) {
        // Temporarily suspend observation handler when syncing changes 
        if (!this._canObserveCollection)
            return;

        // TODO Add/remove observers from modified array contents if they're objects/arrays
        let refIds: Set<string> = new Set<string>();
        splices.forEach((splice: IArrayChangedSplice) => {
            if (splice.addedCount){
                let currentArray = this._collection as any[];
                if (currentArray.length >= splice.index + splice.addedCount){
                    splice.added = [];
                    // Get serialized objects for any array updates/additions to other window
                    for (let i = splice.index; i < splice.index + splice.addedCount; i++){
                        let element: any = currentArray[i];

                        if (!this._utilities.isPrimitive(element) && !this._utilities.isDateObjectCollectionType(element))
                            throw new Error(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Observed Arrays can only contain primitives, Dates, objects, arrays, sets and maps`)

                        let serializedValue: ISerializedObject =  {
                                property: i.toString(),
                                contextId: '',
                                parentId: this._contextId,
                                value: currentArray[i],
                                type: '',
                                childMetadata: [] 
                        };

                        // If the new value is an object/array, we need to recursively observe it too
                        // and pass appropriate metadata
                        if (this._utilities.isDateObjectCollectionType(element)){
                            // serializedValue.value is updated with the serialized object/array 
                            this.bindingEngine.observeObject(serializedValue, element, refIds, this._extensionId);
                        }
                        splice.added.push(serializedValue);
                    }
                }
            }
        })

        // The context of the array is different than this
        var data: IArrayBindingSync = {
            contextId: this._contextId,
            splices: splices,
        } 

        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Array has mutated`, data);
        this._rpc.publish('tapfx.arrayBindingSync', this._extensionId, data);
    
    }

    private _setChanged(changes: ISetChangeRecord[]) {
        // Temporarily suspend observation handler when syncing changes 
        if (!this._canObserveCollection)
            return;

        let refIds: Set<string> = new Set<string>();
        let resolvedChanges: ISetChangeRecord[] = [];
        changes.forEach((change: ISetChangeRecord) => {
            if (!this._utilities.isPrimitive(change.value) && !this._utilities.isDateObjectCollectionType(change.value))
                throw new Error(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Observed sets can only contain primitives, Dates, objects, arrays, sets and maps`)
            let resolvedChange: ISetChangeRecord = {type: change.type, value: change.value};
            if (change.type === "add") {

                let serializedValue: ISerializedObject =  {
                            property: '',
                            contextId: '',
                            parentId: this._contextId,
                            value: change.value,
                            type: '',
                            childMetadata: [] 
                };

                // If the new value is an object/collection, we need to recursively observe it too
                // and pass appropriate metadata
                if (this._utilities.isDateObjectCollectionType(change.value)){
                    // serializedValue.value is updated with the serialized object/array 
                    this.bindingEngine.observeObject(serializedValue, change.value, refIds, this._extensionId);
                    resolvedChange.value = serializedValue;
                    resolvedChange.contextId = serializedValue.contextId;
                }
            }
            if (change.type === "delete"){
                if (this._utilities.isDateObjectCollectionType(change.value)){
                    resolvedChange.contextId = this.bindingEngine.getIdByContext(change.value) === undefined ? (this.bindingEngine.getIdByContext(change.value) as string) : undefined;
                }
            }
            resolvedChanges.push(resolvedChange);
        })

        var data: ISetBindingSync = {
            contextId: this._contextId,
            changes: resolvedChanges
        } 

        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Set has mutated`, data);
        this._rpc.publish('tapfx.setBindingSync', this._extensionId, data);
    }

    private _mapChanged(changes: ISetChangeRecord[]) {
        // Temporarily suspend observation handler when syncing changes 
        if (!this._canObserveCollection)
            return;

        let refIds: Set<string> = new Set<string>();
        let resolvedChanges: IMapChangeRecord[] = [];
        let theMap = this._collection as Map<any, any>;
        changes.forEach((change: IMapChangeRecord) => {
            let resolvedChange: IMapChangeRecord = {
                type: change.type, 
                key: change.key, 
                oldValue: change.oldValue, 
                value: theMap.get(change.key),
                contextId: '',
                keyContextId: '' 
            };
            if ((!this._utilities.isPrimitive(change.key) && !this._utilities.isDateObjectCollectionType(change.key)) ||
                (!this._utilities.isPrimitive(resolvedChange.value) && !this._utilities.isDateObjectCollectionType(resolvedChange.value)))
                throw new Error(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Observed Maps can only contain primitives, Dates, objects, arrays, sets and maps`)

            // value changed (or added)
            if (change.type === 'update' || change.type === 'add'){
                let serializedValue: ISerializedObject =  {
                            property: '',
                            contextId: '',
                            parentId: this._contextId,
                            value: resolvedChange.value,
                            type: '',
                            childMetadata: [] 
                };

                // If the new value is an object/collection, we need to recursively observe it too
                // and pass appropriate metadata, otherwise just get it's contextId
                if (this._utilities.isDateObjectCollectionType(resolvedChange.value)){
                    // serializedValue.value is updated with the serialized object/array 
                    this.bindingEngine.observeObject(serializedValue, resolvedChange.value, refIds, this._extensionId);
                    resolvedChange.value = serializedValue;
                    resolvedChange.contextId = serializedValue.contextId;
                }
            }

            // key and value added
            // value was already handled under the update case above, just just handle key here
            if (change.type === 'add') {
                let serializedKey: ISerializedObject =  {
                            property: '',
                            contextId: '',
                            parentId: this._contextId,
                            value: change.key,
                            type: '',
                            childMetadata: [] 
                };

                // If the new value is an object/collection, we need to recursively observe it too
                // and pass appropriate metadata, otherwise just get it's contextId
                if (this._utilities.isDateObjectCollectionType(change.key)){
                    // serializedValue.value is updated with the serialized object/array 
                    this.bindingEngine.observeObject(serializedKey, change.key, refIds, this._extensionId);
                    resolvedChange.key = serializedKey;
                    resolvedChange.keyContextId = serializedKey.contextId;
                }
            }

            if (change.type === "delete"){
                if (this._utilities.isDateObjectCollectionType(change.oldValue)){
                    resolvedChange.keyContextId = this.bindingEngine.getIdByContext(change.oldValue) === undefined ? (this.bindingEngine.getIdByContext(change.oldValue) as string) : undefined;
                }
            }
            resolvedChanges.push(resolvedChange);
        })

        var data: ISetBindingSync = {
            contextId: this._contextId,
            changes: resolvedChanges
        } 

        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Map has mutated`, data);
        this._rpc.publish('tapfx.mapBindingSync', this._extensionId, data);
    }

    /**
     * User aurelia collection observer to watch for changes to elements in a collection 
     * This watches changes made via array, set and map methods, but does not catch changes
     * made via index assignments (like a[2] = 'foo')
     */
    public observe(): void {
        this.dispose();
        if (this._collection instanceof Array){
            this._collectionObserver = this._observerLocator.getArrayObserver(this._collection);
            this._collectionObserver.subscribe(this._boundArrayChanged);
        }
        if (this._collection instanceof Map){
            this._collectionObserver = this._observerLocator.getMapObserver(this._collection);
            this._collectionObserver.subscribe(this._boundMapChanged);
        }
        if (this._collection instanceof Set){
            // getSetObserver, for some reason, isn't in the Aurelia TypeScript definition file
            // (or included in the online API, which appears to be generated from the d.ts file)
            this._collectionObserver = (this._observerLocator as any).getSetObserver(this._collection);
            this._collectionObserver.subscribe(this._boundSetChanged);
        }
    }

    /**
     * Add or remove elements to the observed array
     * @param splice 
     */
    updateArray(splice: IArrayChangedSplice, disableObservation: boolean = true): void {
        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the array contents are being 
        // updated to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation)
            this._canObserveCollection = false;

        let syncArray = this._collection;
        let removedCount = splice.removed && splice.removed.length ? splice.removed.length : 0;
        let addedItems = splice.addedCount && splice.added ? splice.added : [];
        var args: any[] = [splice.index, removedCount];
        args = args.concat(addedItems);
        Array.prototype.splice.apply(syncArray, args);
        
        if (disableObservation){
            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the SetterObserver 
            if (this._collectionObserver['taskQueue'] === void(0))
                throw new Error(`Collection observer object is missing the taskQueue property.  Aurelia (non-public) API may have changed!`);
            ((this._collectionObserver as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            this._canObserveCollection = true;
        }
    }

    /**
     * Add or remove elements to the observed set
     * @param change 
     * @param disableObservation 
     */
    updateSet(change: ISetChangeRecord, disableObservation: boolean = true): void {
        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the array contents are being 
        // updated to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation)
            this._canObserveCollection = false;
        
        let theSet = this._collection as Set<any>;
        switch(change.type){
            case 'add':
                theSet.add(change.value);
                break;
            case 'delete':
                theSet.delete(change.value);
                break;
            case 'clear':
                theSet.clear();
                break;
        }
        
        if (disableObservation){
            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the SetterObserver 
            if (this._collectionObserver['taskQueue'] === void(0))
                throw new Error(`Collection observer object is missing the taskQueue property.  Aurelia (non-public) API may have changed!`);
            ((this._collectionObserver as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            this._canObserveCollection = true;
        }
    }

    /**
     * Add, update or remove elements to the observed Map 
     * @param change 
     * @param disableObservation 
     */
    updateMap(change: IMapChangeRecord, disableObservation: boolean = true): void {
        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the array contents are being 
        // updated to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation)
            this._canObserveCollection = false;
        
        let theMap = this._collection as Map<any, any>;
        switch(change.type){
            case 'add':
            case 'update':
                theMap.set(change.key, change.value);
                break;
            case 'delete':
                theMap.delete(change.key);
                break;
            case 'clear':
                theMap.clear();
                break;
        }
        
        if (disableObservation){
            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the SetterObserver 
            if (this._collectionObserver['taskQueue'] === void(0))
                throw new Error(`Collection observer object is missing the taskQueue property.  Aurelia (non-public) API may have changed!`);
            ((this._collectionObserver as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            this._canObserveCollection = true;
        }
    }

    public dispose(): void {
        if (this._collectionObserver) {
            this._collectionObserver.unsubscribe(this._boundArrayChanged);
            delete this._collectionObserver;
        }
    }

}

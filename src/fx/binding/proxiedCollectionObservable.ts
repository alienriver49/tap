import { inject } from 'aurelia-dependency-injection';
import { ObserverLocator } from 'aurelia-binding';
import { TaskQueue } from 'aurelia-task-queue';
import { InternalPropertyObserver, InternalCollectionObserver } from 'aurelia-binding'; // type

import { IBindingEngine, ISerializedObject } from './bindingEngine';

import { RpcClient } from '../rpc/client';
import { Utilities } from '../utilities/utilities';
//import { getTapFx } from '../core/bootstrap';

// first three properties are defined by Aurelia, last by us
// Note that these are not explicitly defined in any aurelia public interface,
// but were found via the source code, so may change in the future
export interface IArrayChangedSplice {
    addedCount: number;
    index: number;
    removed: object[];
    added?: ISerializedObject[];
}

/**
 * When sending an RPC message to update the contents of a synced array, this will
 * be the data cargo
 */
export interface IArrayBindingSync {
    contextId: string;
    splices: IArrayChangedSplice[];
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
        private _collection: any[],
        private _extensionId: string,
    ) {
    }

    private _collectionObserver: InternalCollectionObserver;
    private _className: string = (this as object).constructor.name;
    private _boundArrayChanged = this._arrayChanged.bind(this) as (splices: any) => void;
    private _canObserveArray: boolean = true;
    private _bindingEngine: IBindingEngine;

    public get extensionId() {
        return this._extensionId;
    }

    // Using the BindingEngine in this class does introduce some circular dependencies, but they should be ok because
    // a ProxiedObservable will only be created (injected) by the BindingEngine, but the BindingEngine isn't DI'ed into
    // the ProxiedObservable and won't be used in the ProxiedObservable until this _propertyChanged function is called, 
    // so we can be assured that the BindingEngine is available at this point
    private get bindingEngine() {
        if (!this._bindingEngine) {
            //this._bindingEngine = getTapFx().BindingEngine; 
        }

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
        if (!this._canObserveArray) {
            return;
        }

        // TODO Add/remove observers from modified array contents if they're objects/arrays
        splices.forEach((splice: IArrayChangedSplice) => {
            if (splice.addedCount) {
                const currentArray = this._collection;
                if (currentArray.length >= splice.index + splice.addedCount) {
                    splice.added = [];

                    const refIds: Set<string> = new Set<string>();
                    // Get serialized objects for any array updates/additions to other window
                    for (let i = splice.index; i < splice.index + splice.addedCount; i++) {
                        const element: any = currentArray[i];

                        const serializedValue: ISerializedObject =  {
                                property: i.toString(),
                                contextId: '',
                                parentId: this._contextId,
                                value: currentArray[i],
                                type: '',
                                childMetadata: [] 
                        };

                        // If the new value is an object/array, we need to recursively observe it too
                        // and pass appropriate metadata
                        if (element instanceof Array || this._utilities.isObject(element)) {
                            // serializedValue.value is updated with the serialized object/array 
                            this.bindingEngine.observeObject(serializedValue, element, refIds, this._extensionId);
                        }
                        splice.added.push(serializedValue);
                    }
                }
            }
        });

        // The context of the array is different than this
        const data: IArrayBindingSync = {
            contextId: this._contextId,
            splices,
        };

         console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Array has mutated`, data);
         this._rpc.publish('tapfx.arrayBindingSync', this._extensionId, data);
        

    }

    /**
     * User aurelia collection observer to watch for changes to elements in an array
     * This watches changes made via array methods, but does not catch changes
     * made via index assignments (like a[2] = 'foo')
     */
    public observe(): void {
        this.dispose();
        this._collectionObserver = this._observerLocator.getArrayObserver(this._collection);
        this._collectionObserver.subscribe(this._boundArrayChanged);
    }

    /**
     * Add or remove elements to the observed array
     * @param splice 
     */
    public updateArray(splice: IArrayChangedSplice, disableObservation: boolean = true): void {
        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the array contents are being 
        // updated to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation) {
            this._canObserveArray = false;
        }

        const syncArray = this._collection;
        const removedCount = splice.removed && splice.removed.length ? splice.removed.length : 0;
        const addedItems = splice.addedCount && splice.added ? splice.added : [];
        var args: any[] = [splice.index, removedCount];
        args = args.concat(addedItems);
        Array.prototype.splice.apply(syncArray, args);
        
        if (disableObservation) {
            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the SetterObserver 
            if (this._collectionObserver['taskQueue'] === void(0)) {
                throw new Error(`Collection observer object is missing the taskQueue property.  Aurelia (non-public) API may have changed!`);
            }

            ((this._collectionObserver as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            this._canObserveArray = true;
        }

    }

    public dispose(): void {
        if (this._collectionObserver) {
            this._collectionObserver.unsubscribe(this._boundArrayChanged);
            delete this._collectionObserver;
        }
    }
}

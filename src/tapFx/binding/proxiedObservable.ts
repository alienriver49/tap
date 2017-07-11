import { inject } from 'aurelia-dependency-injection'
import { ObserverLocator} from 'aurelia-binding';
import { TaskQueue } from 'aurelia-task-queue';
import RpcClient from './../rpc/client'
import Utilities from './../utilities/utilities'
import { InternalPropertyObserver, InternalCollectionObserver, Callable} from 'aurelia-binding'; // type

// first three properties are defined by Aurelia, last by us
// Note that these are not explicitly defined in any aurelia public interface,
// but were found via the source code, so may change in the future
export interface IArrayChangedSplice {
    addedCount: number, 
    index: number, 
    removed: Object[],
    added?: Object[]
};

/**
 * When sending an RPC message to update the contents of a synced array, this will
 * be the data cargo
 */
export interface IArrayBindingSync {
    contextID: string,
    property: string,
    splices: IArrayChangedSplice[],
}

/**
 * When sending an RPC message to update a property on a synced object, this will
 * be the data cargo
 */
export interface IPropertyBindingSync {
    contextID: string,
    property: string,
    newValue: any,
    oldValue: any,
    syncObjectContextId: string
}

/**
 * Built on the Aurelia ObserverLocator module, this class will watch:
 * 1) a particular property for changes
 * 2) If the property is an array, watch for changes to the array contents
 * Any changes will trigger an RPC call to sync the changes to the other window
 */
@inject(ObserverLocator, RpcClient, Utilities)
export class ProxiedObservable implements Callable {
    constructor(
        private _observerLocator: ObserverLocator,
        private _rpc: RpcClient,
        private _utilities: Utilities,
        private _contextID: string,
        private _context: Object,
        private _property: string,
        private _extensionId: string,
    ) { 
    }

    private _bindingEngine = window.TapFx.BindingEngine;
    private _observer: InternalPropertyObserver;
    private _collectionObserver: InternalCollectionObserver;
    private _className: string = (this as Object).constructor.name;
    private _boundPropertyChanged = this._propertyChanged.bind(this) as (newValue: any, oldValue: any) => void;
    private _boundArrayChanged = this._arrayChanged.bind(this) as (splices: any) => void;
    private _canObserveArray: boolean = true;
    private _canObserveProperty: boolean = true;

    public get extensionId(){
        return this._extensionId;
    }

    private _propertyChanged(newValue: any, oldValue: any) {
        // Temporarily suspend observation handler when syncing changes 
        if (!this._canObserveProperty)
            return;
        if (newValue === oldValue) return;
        // TODO: observing / syncing of objects
        if (JSON.stringify(newValue) === JSON.stringify(oldValue)) 
            return; // temp, for object observation to stop an infinite loop from happening. only works if the order of properties is always the same

        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Property has changed from: "${oldValue}" to: "${newValue}"`);
        var data: IPropertyBindingSync = {
            contextID: this._contextID,
            property: this._property,
            newValue: newValue,
            oldValue: oldValue,
            syncObjectContextId: ''
        } 

        // TODO: dispose of observers on properties where oldValue is an object

        // If the new value is an object, we need to recursively observe it too
        // and pass appropriate metadata
        if (this._utilities.isObject(newValue)){
            let syncValue = this._bindingEngine.observeObject(newValue, this._extensionId);
            if (syncValue){
                data.newValue = syncValue;
                // Need to pass the context Id for the new object as well
                data.syncObjectContextId = syncValue._syncObjectContextId;
            }
        }

        this._rpc.publish('tapfx.propertyBindingSync', this._extensionId, data);

        // check for a convention function for handling property changed events. note: Aurelia can do this but requires an @observable decorator on the variable (creates a getter / setter) and that currently doesn't work with our function serialization
        let propertyChangedHandler = `${this._property}Changed`;
        if (propertyChangedHandler in this._context &&
            this._utilities.classOf(this._context[propertyChangedHandler]) === '[object Function]'
        ) {
            this._context[propertyChangedHandler](newValue, oldValue);
        }

        // if the property is an array, need to unsubscribe collectionObserver
        // and resubscribe to new array (for locally initiated changes) 
        // RPC initiated changes are handled in setValue 
        this._updateCollectionObserver(newValue);
    }

    /**
     * Array contents have changed.  splices objects have most of the data we need 
     * to sync, but for additions we need to pass the actual added elements
     * https://ilikekillnerds.com/2015/10/observing-objects-and-arrays-in-aurelia/
     * @param splices 
     */
    private _arrayChanged(splices: IArrayChangedSplice[]) {
        // Temporarily suspend observation handler when syncing changes 
        if (!this._canObserveArray)
            return;

        // TODO Add/remove observers from modified array contents if they're objects/arrays
        splices.forEach((splice: IArrayChangedSplice) => {
            if (splice.addedCount){
                let currentArray = this._context[this._property];
                if (currentArray.length >= splice.index + splice.addedCount)
                    // TODO slice just creates a shallow copy, but we'll need full
                    splice.added = currentArray.slice(splice.index, (splice.index + splice.addedCount));
            }
        })
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Array has mutated`);

        var data: IArrayBindingSync = {
            contextID: this._contextID,
            property: this._property,
            splices: splices,
        } 
        this._rpc.publish('tapfx.arrayBindingSync', this._extensionId, data);
    }

    public property(): string {
        return this._property;
    }

    public observe(): void {
        if (this._observer) throw new Error("Property is already being observed.");
        let value = this._context[this._property];

        if (value instanceof Array) {
            // ArrayObserver only tracks modifications to an array
            // getArrayObserver returns an instance of ModifyCollectionObserver
            // (with SubscriberCollection), although the full API for them 
            // isn't shown in the documentation (officially the getArrayObserver
            // just returns InternalCollectionObserver which only has a subscribe and
            // unsubscribe on it)
            // 
            this._collectionObserver = this._observerLocator.getArrayObserver(value);
            this._collectionObserver.subscribe(this._boundArrayChanged);

            // Still need regular observer if array is completely replaced
            this._observer = this._observerLocator.getObserver(this._context, this._property);
        } else {
            this._observer = this._observerLocator.getObserver(this._context, this._property);
        }

        this._observer.subscribe(this._boundPropertyChanged);
    }

    setValue(value: any, disableObservation: boolean = true): void {
        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the value is being 
        // set to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation)
            this._canObserveProperty = false;

        // if the property is an array, need to unsubscribe collectionObserver
        // and resubscribe to new array (for changes via RPC) 
        // Locally initiated changes are handled in _propertyChanged 
        this._updateCollectionObserver(value);

        this._observer.setValue(value);

        if (disableObservation){
            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the ModifyCollectionObserver
            ((this._observer as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            this._canObserveProperty= true;
        }
    }

    /**
     * Add or remove elements to the observed array
     * @param splice 
     */
    updateArray(splice: IArrayChangedSplice, disableObservation: boolean = true): void {
        if (!(this._context[this._property] instanceof Array)) {
            return;
        }

        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the array contents are being 
        // updated to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation)
            this._canObserveArray = false;

        let syncArray = this._context[this._property];
        if (splice.addedCount && splice.added){
            // Use Function.apply to pass an array to splice
            var args: any[] = [splice.index, 0];
            args = args.concat(splice.added);
            Array.prototype.splice.apply(syncArray, args);
        }
        if (splice.removed && splice.removed.length){
           syncArray.splice(splice.index, splice.removed.length);
        }
        
        if (disableObservation){
            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the SetterObserver 
            ((this._collectionObserver as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            this._canObserveArray = true;
        }

    }

    // Not currently used, but is an alternative to pass as second argument when creating observers to act as the callback
    public call(context: any, newValueOrChangeRecords: any, oldValue?: any): void {
        if (context && context instanceof Array){
            this._arrayChanged(newValueOrChangeRecords as IArrayChangedSplice[]);
        }
    }

    /**
     * If the property being watched is an array and is changed (not contents modified),
     * then this should be called to dispose of subscriber on old array and begin 
     * observing the new array
     * @param value Current array value
     */
    private _updateCollectionObserver(value: any){
        if (value instanceof Array){
            this._disposeCollectionObserver();
            this._collectionObserver = this._observerLocator.getArrayObserver(this._context[this._property]);
            this._collectionObserver.subscribe(this._boundArrayChanged);
        }

    }

    dispose(): void {
        if (this._observer) {
            this._observer.unsubscribe(this._boundPropertyChanged);
            delete this._observer;
        }
        this._disposeCollectionObserver();
    }

    private _disposeCollectionObserver(): void {
        if (this._collectionObserver) {
            this._collectionObserver.unsubscribe(this._boundArrayChanged);
            delete this._collectionObserver;
        }
    }
}

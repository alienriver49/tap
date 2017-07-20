import { inject } from 'aurelia-dependency-injection'
import { ObserverLocator} from 'aurelia-binding';
import { TaskQueue } from 'aurelia-task-queue';
import RpcClient from './../rpc/client'
import Utilities from './../utilities/utilities'
import { InternalPropertyObserver, InternalCollectionObserver, Callable } from 'aurelia-binding'; // type

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
        private _parentContextId
    ) { 
    }

    private _observer: InternalPropertyObserver;
    private _collectionObserver: InternalCollectionObserver;
    private _className: string = (this as Object).constructor.name;
    private _boundPropertyChanged = this._propertyChanged.bind(this) as (newValue: any, oldValue: any) => void;
    private _boundArrayChanged = this._arrayChanged.bind(this) as (splices: any) => void;
    private _canObserveArray: boolean = true;
    private _canObserveProperty: boolean = true;
    private _isProxy = Symbol("is-proxy");

    public get extensionId(){
        return this._extensionId;
    }

    private _propertyChanged(newValue: any, oldValue: any) {
        // Temporarily suspend observation handler when syncing changes 
        if (!this._canObserveProperty)
            return;
        if (newValue === oldValue) return;

        var data: IPropertyBindingSync = {
            contextID: this._contextID,
            property: this._property,
            newValue: newValue,
            oldValue: null,  // Not used 
            syncObjectContextId: ''
        } 

        // TODO: Re-add this functionality, though we need to remove the dependancy on _bindingEngine due to issues with DI (and circular dependancies). Could communicate to the binding engine via RPC or move this logic to the binding engine
        /*if (this._utilities.isObject(oldValue)){
            let oldContextId = this._bindingEngine.getIdByContext(oldValue);
            // If oldValue is an object mapped in the BindingEngine, then
            // dispose of any observers on it
            if (oldContextId)
                this._bindingEngine._unobserve(oldValue, '', oldContextId);
        }

        // If the new value is an object, we need to recursively observe it too
        // and pass appropriate metadata
        if (this._utilities.isObject(newValue)){
            // Check if objects have changed
            // The old value should have an existing context Id, so if the new value
            // is the same object, it should have the same context Id and no change
            if (this._utilities.isObject(oldValue)){
                let oldContextId = this._bindingEngine.getIdByContext(oldValue);
                let newContextId = this._bindingEngine.getIdByContext(newValue);
                if (oldContextId && newContextId && oldContextId === newContextId)
                    return;
            }

            let refIds: Set<string> = new Set<string>();
            let syncValue = this._bindingEngine.observeObject(newValue, this._contextID, refIds, this._extensionId);
            if (syncValue){
                data.newValue = syncValue;
                // Need to pass the context Id for the new object as well
                data.syncObjectContextId = syncValue._syncObjectContextId;
            }
        }*/

        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Property has changed from: "${oldValue}" to: "${newValue}"`);
        this._rpc.publish('tapfx.propertyBindingSync', this._extensionId, data);

        // if the property is an array, need to unsubscribe collectionObserver
        // and resubscribe to new array (for locally initiated changes) 
        // RPC initiated changes are handled in setValue 
        this._updateCollectionObserver(newValue);

        // check for a convention function for handling property changed events. note: Aurelia can do this but requires an @observable decorator on the variable (creates a getter / setter) and that currently doesn't work with our function serialization
        let propertyChangedHandler = `${this._property}Changed`;
        if (propertyChangedHandler in this._context &&
            this._utilities.classOf(this._context[propertyChangedHandler]) === '[object Function]'
        ) {
            this._context[propertyChangedHandler](newValue, oldValue);
        }

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
                if (currentArray.length >= splice.index + splice.addedCount){
                    // TODO slice just creates a shallow copy, but we'll need full
                    splice.added = currentArray.slice(splice.index, (splice.index + splice.addedCount));
                    // let addedItems: any = currentArray.slice(splice.index, (splice.index + splice.addedCount));
                    // let refIds: Set<string> = new Set<string>();
                    // let syncValue = this._bindingEngine.observeObject(newValue, this._contextID, refIds, this._extensionId);
                    // if (syncValue){
                    //     data.newValue = syncValue;
                    //     // Need to pass the context Id for the new object as well
                    //     data.syncObjectContextId = syncValue._syncObjectContextId;
                    // }
                }
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

    /**
     * If property is an array, it's original value is returned for serializing purposes
     * postMessage has trouble if there is a Proxy in the passed data
     */
    public observe(): null | any[] {
        if (this._observer) 
        throw new Error("Property is already being observed.");

        let originalArray: any[] | null = null;
        let originalValue = this._context[this._property];

        if (originalValue instanceof Array) {
            originalArray = originalValue;

            this._updateCollectionObserver(originalValue);

            // Still need regular observer if array is completely replaced
            this._observer = this._observerLocator.getObserver(this._context, this._property);
        } else {
            this._observer = this._observerLocator.getObserver(this._context, this._property);
        }

        this._observer.subscribe(this._boundPropertyChanged);

        return originalArray;
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
        let propertyWasUpdatedToArrayProxy = this._updateCollectionObserver(value);

        if (!propertyWasUpdatedToArrayProxy)
            this._observer.setValue(value);

        if (disableObservation){
            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the ModifyCollectionObserver
            if (this._observer['taskQueue'] === void(0))
                throw new Error(`Observer object is missing the taskQueue property.  Aurelia (non-public) API may have changed!`);
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
     * It returns whether or not the context[property] was updated to an array proxy
     * @param originalValue Current array value
     */
    private _updateCollectionObserver(originalValue: any): boolean {
        let wasUpdated = false;

        if (originalValue instanceof Array){
            this._disposeCollectionObserver();

            // This proxy is just used to watch for array changes using array indexes
            // for example, a[2] = 10
            let value = new Proxy(originalValue, {
                set: this.proxyArraySet.bind(this),
                get: this.proxyArrayGet.bind(this)
            });
            // Update the property to use the array proxy (temporarily disabling observer)
            let _canObservePropertyState = this._canObserveProperty
            this._canObserveProperty = false;

            this._context[this._property] = value;
            wasUpdated = true;

            // Flush the property changed queue, if possible
            if (this._observer){
                if (this._observer['taskQueue'] === void(0))
                    throw new Error(`Observer object is missing the taskQueue property.  Aurelia (non-public) API may have changed!`);
                ((this._observer as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            } 
            this._canObserveProperty = _canObservePropertyState;

            // ArrayObserver only tracks modifications to an array through array methods
            // getArrayObserver returns an instance of ModifyCollectionObserver
            // (with SubscriberCollection), although the full API for them 
            // isn't shown in the documentation (officially the getArrayObserver
            // just returns InternalCollectionObserver which only has a subscribe and
            // unsubscribe on it)

            this._collectionObserver = this._observerLocator.getArrayObserver(this._context[this._property]);
            this._collectionObserver.subscribe(this._boundArrayChanged);
        }
        return wasUpdated;
    }

    proxyArraySet(target: any[], property: PropertyKey, newValue: any, receiver: any): boolean {
        if (this._arrayChanging)
            // Called via an array method, so just assign property
            target[property] = newValue;
        else{
            // Called via index assignment, so just remap the assignment to an array 'splice' call
            let index = parseInt(property as string);
            if (Number.isNaN(index))
                target[property] = newValue;
            else{
                this._arrayChanging = false;
                target.splice(Number(property), 1, newValue);
            }
        }
        
        return true;
    }

    // Getter method allows us to modify the array methods and provide a 
    // way to test if the array is a proxy
    // if obj[this._isProxy] === true, then it's a proxy
    proxyArrayGet (target: any[], key: PropertyKey): any {
        // When modifying the array, use our custom proxy functions
        if (key === 'push')
            return this.proxyArrayPush.bind(this);
        if (key === 'pop')
            return this.proxyArrayPop.bind(this);
        if (key === 'reverse')
            return this.proxyArrayReverse.bind(this);
        if (key === 'shift')
            return this.proxyArrayShift.bind(this);
        if (key === 'sort')
            return this.proxyArraySort.bind(this);
        if (key === 'splice')
            return this.proxyArraySplice.bind(this);
        if (key === 'unshift')
            return this.proxyArrayUnshift.bind(this);
        if (!target[this._isProxy]){
            return target[key];
        }
        return true;
    }

    private _arrayChanging: boolean = false;
    private proxyArrayPush(): any {
        this._arrayChanging = true; 
        let obj = this._context[this._property];
        let methodCallResult = Array.prototype.push.apply(obj, arguments);
        this._arrayChanging = false;
        return methodCallResult;
    }
    private proxyArrayPop(): any {
        this._arrayChanging = true; 
        let obj = this._context[this._property];
        let methodCallResult = Array.prototype.pop.apply(obj, arguments);
        this._arrayChanging = false;
        return methodCallResult;
    }
    private proxyArrayReverse(): any {
        this._arrayChanging = true; 
        let obj = this._context[this._property];
        let methodCallResult = Array.prototype.reverse.apply(obj, arguments);
        this._arrayChanging = false;
        return methodCallResult;
    }
    private proxyArrayShift(): any {
        this._arrayChanging = true; 
        let obj = this._context[this._property];
        let methodCallResult = Array.prototype.shift.apply(obj, arguments);
        this._arrayChanging = false;
        return methodCallResult;
    }
    private proxyArraySort(): any {
        this._arrayChanging = true; 
        let obj = this._context[this._property];
        let methodCallResult = Array.prototype.sort.apply(obj, arguments);
        this._arrayChanging = false;
        return methodCallResult;
    }
    private proxyArraySplice(): any {
        this._arrayChanging = true; 
        let obj = this._context[this._property];
        let methodCallResult = Array.prototype.splice.apply(obj, arguments);
        this._arrayChanging = false;
        return methodCallResult;
    }
    private proxyArrayUnshift(): any {
        this._arrayChanging = true; 
        let obj = this._context[this._property];
        let methodCallResult = Array.prototype.unshift.apply(obj, arguments);
        this._arrayChanging = false;
        return methodCallResult;
    }

    public dispose(): void {
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

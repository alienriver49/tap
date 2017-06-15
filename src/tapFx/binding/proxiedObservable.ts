import { inject } from 'aurelia-dependency-injection'
import { ObserverLocator } from 'aurelia-binding';
import RpcClient from './../rpc/client'
import Utilities from './../utilities/utilities'
import { InternalPropertyObserver, Callable } from 'aurelia-binding'; // type

@inject(ObserverLocator, RpcClient, Utilities)
class ProxiedObservable implements Callable {
    constructor(
        private _observerLocator: ObserverLocator,
        private _rpc: RpcClient,
        private _utilities: Utilities,
        private _contextID: string,
        private _context: Object,
        private _property: string,
        private _extensionId: string
    ) { 
        var dmf = 1;
    }

    private _observer: InternalPropertyObserver;
    private _className: string = (this as Object).constructor.name;
    private _boundPropertyChanged = this._propertyChanged.bind(this) as (newValue: any, oldValue: any) => void;

    public call(context: any, newValueOrChangeRecords: any, oldValue?: any): void {
        if (oldValue !== undefined)
            this.callWithOldAndNew(context, newValueOrChangeRecords, oldValue);
        else
            this.callWithChangeRecords(context, newValueOrChangeRecords);

    }

    private callWithOldAndNew(context: any, newValue: any, oldValue: any): void {

    }
    private callWithChangeRecords(context: any, changeRecords: any): void {

    }

    private _propertyChanged(newValue: any, oldValue: any) {
        if (newValue === oldValue) return;
        // TODO: observing / syncing of objects
        if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return; // temp, for object observation to stop an infinite loop from happening. only works if the order of properties is always the same

        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Property has changed from: "${oldValue}" to: "${newValue}"`);
        this._rpc.publish('tapfx.bindingSync', this._extensionId, {
            contextID: this._contextID,
            property: this._property,
            newValue: newValue,
            oldValue: oldValue
        });

        let propertyChangedHandler = `${this._property}Changed`;
        if (propertyChangedHandler in this._context &&
            this._utilities.classOf(this._context[propertyChangedHandler]) === '[object Function]'
        ) {
            this._context[propertyChangedHandler](newValue, oldValue);
        }
    }

    property(): string {
        return this._property;
    }

    observe(): void {
        if (this._observer) throw new Error("Property is already being observed.");
        // TODO: observing / syncing of arrays
        /*if (this._context[this._property] instanceof Array) {
            this._observer = this._observerLocator.getArrayObserver(this._context[this._property]);
        } else {*/
            this._observer = this._observerLocator.getObserver(this._context, this._property);
        //}
        this._observer.subscribe(this._boundPropertyChanged);
    }

    setValue(value: any, disableObservation: boolean = true): void {
        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the value is being 
        // set to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation)
            this._observer.unsubscribe(this._boundPropertyChanged);
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Setting property ${this._property} to: "${value}"`);
        this._observer.setValue(value);
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Done setting property ${this._property} to: "${value}"`);
        if (disableObservation)
            this._observer.subscribe(this._boundPropertyChanged);
    }

    dispose(): void {
        if (this._observer) {
            this._observer.unsubscribe(this._propertyChanged);
            delete this._observer;
        }
    }
}

export default ProxiedObservable;
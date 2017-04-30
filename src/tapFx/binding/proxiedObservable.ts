import { inject } from 'aurelia-dependency-injection'
import { ObserverLocator } from 'aurelia-binding';
import RpcClient from './../rpc/client'
import Utilities from './../utilities/utilities'
import { InternalPropertyObserver } from 'aurelia-binding'; // type

@inject(ObserverLocator, RpcClient, Utilities)
class ProxiedObservable {
    constructor(
        private _observerLocator: ObserverLocator,
        private _rpc: RpcClient,
        private _utilities: Utilities,
        private _contextID: string,
        private _context: Object,
        private _property: string
    ) { }

    private _observer: InternalPropertyObserver;

    private _propertyChanged(newValue: any, oldValue: any) {
        if (newValue === oldValue) return;

        console.log('[TAP-FX] Property has changed from: "', oldValue, '" to: "', newValue, '"');
        this._rpc.publish('tapfx.bindingSync', {
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
        this._observer = this._observerLocator.getObserver(this._context, this._property);
        this._observer.subscribe(this._propertyChanged.bind(this));
    }

    setValue(value: any): void {
        this._observer.setValue(value);
    }

    dispose(): void {
        if (this._observer) {
            this._observer.unsubscribe(this._propertyChanged);
            delete this._observer;
        }
    }
}

export default ProxiedObservable;
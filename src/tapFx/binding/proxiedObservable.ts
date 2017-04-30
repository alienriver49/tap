import { inject } from 'aurelia-dependency-injection'
import { ObserverLocator } from 'aurelia-binding';
import { InternalPropertyObserver } from 'aurelia-binding'; // type

@inject(ObserverLocator)
class ProxiedObservable {
    constructor(
        private _observerLocator: ObserverLocator,
        private _context: Object,
        private _property: string
    ) { }

    private _observer: InternalPropertyObserver;

    private _propertyChanged(newValue: any, oldValue: any) {
        console.log('OMG....blade title has changed.... from:', oldValue, ' to:', newValue);
    }

    property(): string {
        return this._property;
    }

    observe(): void {
        this._observer = this._observerLocator.getObserver(this._context, this._property);
        this._observer.subscribe(this._propertyChanged);
    }

    dispose(): void {
        if (this._observer) {
            this._observer.unsubscribe(this._propertyChanged);
            delete this._observer;
        }
    }
}

export default ProxiedObservable;
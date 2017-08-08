import { inject } from 'aurelia-dependency-injection';
import { ObserverLocator, InternalPropertyObserver, InternalCollectionObserver } from 'aurelia-binding';
import { TaskQueue } from 'aurelia-task-queue';

import { IBindingEngine, ISerializedObject } from './bindingEngine';

import { RpcClient } from '../rpc/client';
import { Utilities } from '../utilities/utilities';
//import { getTapFx } from '../core/bootstrap';

/**
 * Built on the Aurelia ObserverLocator module, this class will watch:
 * 1) a particular property for changes
 * 2) If the property is an array, watch for changes to the array contents
 * Any changes will trigger an RPC call to sync the changes to the other window
 */
@inject(ObserverLocator, RpcClient, Utilities)
export class ProxiedObservable {
    constructor(
        private _observerLocator: ObserverLocator,
        private _rpc: RpcClient,
        private _utilities: Utilities,
        private _contextId: string,
        private _context: object,
        private _property: string,
        private _extensionId: string,
        private _bindingEngine: IBindingEngine
    ) { 
    }

    private _observer: InternalPropertyObserver;
    private _className: string = (this as object).constructor.name;
    private _boundPropertyChanged = this._propertyChanged.bind(this) as (newValue: any, oldValue: any) => void;
    private _canObserveProperty: boolean = true;

    public get extensionId() {
        return this._extensionId;
    }

    private _propertyChanged(newValue: any, oldValue: any) {
        // Temporarily suspend observation handler when syncing changes 
        if (!this._canObserveProperty) {
            return;
        }
        
        if (newValue === oldValue) {
            return;
        }

        const serializedValue: ISerializedObject =  {
            property: this._property,
            contextId: '',
            parentId: this._contextId,
            value: newValue,
            type: '',
            childMetadata: [] 
        };

        if (this._utilities.isObject(oldValue) || this._utilities.isCollectionType(oldValue)) {
            const oldContextId = this._bindingEngine.getIdByContext(oldValue);
            // If oldValue is an object mapped in the BindingEngine, then
            // dispose of any observers on it
            if (oldContextId) {
                this._bindingEngine.unobserve(oldValue, this._contextId, this._property, oldContextId, false, false, false, false);
            }
        }

        if (!this._utilities.isPrimitive(newValue) && !this._utilities.isDateObjectCollectionType(newValue)) {
            throw new Error(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Observed properties can only be primitives, Dates,objects, arrays, sets and maps`);
        }

        // If the new value is an object, we need to recursively observe it too
        // and pass appropriate metadata
        if (this._utilities.isDateObjectCollectionType(newValue)) {
            // Check if objects have changed
            // The old value should have an existing context Id, so if the new value
            // is the same object, it should have the same context Id and no change
            if (this._utilities.isObject(oldValue)) {
                const oldContextId = this._bindingEngine.getIdByContext(oldValue);
                const newContextId = this._bindingEngine.getIdByContext(newValue);

                if (oldContextId && newContextId && oldContextId === newContextId) {
                    return;
                }
            }

            // serializedValue.value is updated with the serialized object/array 
            this._bindingEngine.observeObject(serializedValue, newValue, new Set<string>(), this._extensionId, false, false);
        }

        console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Property "${this._property}" has changed from: "${oldValue}" to: "${newValue}"`);
        this._rpc.publish('tapfx.propertyBindingSync', this._extensionId, serializedValue);

        // check for a convention function for handling property changed events. note: Aurelia can do this but requires an @observable decorator on the variable (creates a getter / setter) and that currently doesn't work with our function serialization
        const propertyChangedHandler = `${this._property}Changed`;
        if (propertyChangedHandler in this._context &&
            this._utilities.classOf(this._context[propertyChangedHandler]) === '[object Function]'
        ) {
            this._context[propertyChangedHandler](newValue, oldValue);
        }

    }

    public property(): string {
        return this._property;
    }

    /**
     * Create an aurelia observer for this property and subscribe a changes callback
     */
    public observe(): void {
        if (this._observer) {
            throw new Error('Property is already being observed.');
        }
        
        this._observer = this._observerLocator.getObserver(this._context, this._property);
        this._observer.subscribe(this._boundPropertyChanged);
    }

    public setValue(value: any, disableObservation: boolean = true): void {
        // If this was called due to an RPC message, we probably want to 
        // temporarily disable the observation while the value is being 
        // set to avoid 'duplicate' messages back to the RPC message source
        if (disableObservation) {
            this._canObserveProperty = false;
        }

        this._observer.setValue(value);

        if (disableObservation) {
            // check for a convention function for handling property changed events. 
            // note: Aurelia can do this but requires an @observable decorator on the variable 
            // (creates a getter / setter) and that currently doesn't work with our function serialization
            // Normally this is done in the _propertyChanged function above, but when the property is 
            // set via a postMessage, observation is disabled, so need to do it here
            const propertyChangedHandler = `${this._property}Changed`;
            if (propertyChangedHandler in this._context &&
                this._utilities.classOf(this._context[propertyChangedHandler]) === '[object Function]'
            ) {
                this._context[propertyChangedHandler](value, [this._context[this._property]]);
            }


            // Flush the recent changes and re-enable observation
            // We're using the unexposed taskQueue property on the ModifyCollectionObserver
            if (this._observer['taskQueue'] === void(0)) {
                throw new Error(`Observer object is missing the taskQueue property.  Aurelia (non-public) API may have changed!`);
            }
            
            ((this._observer as any).taskQueue as TaskQueue).flushMicroTaskQueue();
            this._canObserveProperty = true;
        }
    }

    public dispose(): void {
        if (this._observer) {
            this._observer.unsubscribe(this._boundPropertyChanged);
            delete this._observer;
        }
    }
}

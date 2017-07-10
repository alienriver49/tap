import { inject, Factory } from 'aurelia-dependency-injection'
import Utilities from './../utilities/utilities';
import RpcClient from './../rpc/client'
import {ProxiedObservable, IPropertyBindingSync, IArrayBindingSync, IArrayChangedSplice} from './proxiedObservable'

@inject(Utilities, RpcClient, Factory.of(ProxiedObservable))
class BindingEngine {
    constructor(
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _proxiedObservableFactory: (...args: any[]) => ProxiedObservable
    ) {
        _rpc.subscribe('tapfx.propertyBindingSync', this._onPropertyBindingSync.bind(this));
        _rpc.subscribe('tapfx.arrayBindingSync', this._onArrayBindingSync.bind(this));
    }

    private _className: string = (this as Object).constructor.name;
    private _contextIdMap: Map<Object, string> = new Map();
    private _contextObserversMap: Map<string, ProxiedObservable[]> = new Map();

    private _onPropertyBindingSync(data: IPropertyBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Property binding sync.`, data);
        let allObservers = this._contextObserversMap.get(data.contextId);
        let observer = (allObservers || []).find((i) => {
            return i.propertyPath() === data.propertyPath;
        });
        
        observer && observer.setValue(data.newValue, true);
    }

    private _onArrayBindingSync(data: IArrayBindingSync): void {
        console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Array binding sync.`, data);
        let allObservers = this._contextObserversMap.get(data.contextId)
        let observer = (allObservers || []).find((i) => {
            return i.property() === data.property;
        });

        // splice changes into the array
        data.splices.forEach((splice: IArrayChangedSplice) => {
            observer && observer.updateArray(splice, true);
        })
    }

    /**
     * Associates an Id with a context.
     * @param context Context owning the observable properties.
     * @param contextId An Id to associate with the context.
     */
    resolveId(context: Object, contextId: string): void {
        if (this._contextIdMap.has(context)) {
            throw new Error('Cannot resolve ID. An ID already exists for the specified context.');
        }
        this._contextIdMap.set(context, contextId);
        // only empty the _contextObserversMap for this contextId if it's not been set before
        if (this._contextObserversMap.get(contextId) === undefined) this._contextObserversMap.set(contextId, []);
    }

    /**
     * Observe the passed property of the passed context for binding.
     * @param context The context to use for observing.
     * @param property Which property on the context to observe.
     * @param extensionId 
     * @param propertyPath This is the property path for observation so that we can deal with deep object observation.
     */
    observe(context: Object, property: string, extensionId: string = "", propertyPath: string = ""): void {
        // if not set, default to the passed property
        if (propertyPath === "") propertyPath = property;
        // if it is the first property to be observed on the context, keep track of the context as being observed
        let contextId = this._contextIdMap.get(context);
        if (!contextId) {
            throw new Error("Missing context ID. The context ID must first be resolved before observing properties on the context.")
        }

        // make sure the property is not currently being observed
        let existingObserverIndex = (this._contextObserversMap.get(contextId) || []).findIndex((i) => {
            return i.propertyPath() === propertyPath;
        });

        if (existingObserverIndex === -1) {
            let observer = this._proxiedObservableFactory(contextId, context, property, extensionId, propertyPath);
            observer.observe();

            // keep track of the current observer            
            (this._contextObserversMap.get(contextId) || []).push(observer);
        }

        // if the property itself is an object, then recursively observe it's properties.
        // note: classOf [object Object] should work fine for now
        if (context[property] !== null && this._utilities.classOf(context[property]) === '[object Object]') {
            // resolve the context of this object to be the same as the parent context, otherwise we would have to keep track of the Ids of context objects between the shell and tap-fx
            this.resolveId(context[property], contextId);
            // loop through and observer all the properties
            Object.keys(context[property]).forEach((key) => {
                // append the key to the property path
                propertyPath = propertyPath + '.' + key;
                this.observe(context[property], key, extensionId, propertyPath);
            });
        }
    }

    /**
     * Unobserve a specific context.
     * @param context 
     */
    unobserve(context: Object): void {
        // get this context from the map
        let contextId = this._contextIdMap.get(context);
        if (!contextId) {
            throw new Error("Couldn't find content ID when unobserving context.")
        }

        // dispose of any observers
        (this._contextObserversMap.get(contextId) || []).forEach((proxiedObservable) => {
            proxiedObservable.dispose();
        });

        // remove the context from the map
        this._contextIdMap.delete(context);

        // loop through the context and remove any object observations
        Object.keys(context).forEach((property) => {
            if (context[property] !== null && this._utilities.classOf(context[property]) === '[object Object]') {
                // just remove this from the context id map
                this._contextIdMap.delete(context[property]);
                // could do this recursively as well, but would be overkill since we already disposed of all proxiedObservable
                //this.unobserve(context[property]);
            }
        });
    }

    /**
     * Unobserve all contexts.
     */
    unobserveAll(): void {
        this._contextObserversMap.forEach((proxiedObservables, key) => {
            proxiedObservables.forEach((proxiedObservable) => proxiedObservable.dispose());
        });

        this._contextIdMap.clear();
    }
}

export default BindingEngine;
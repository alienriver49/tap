import { inject, Factory } from 'aurelia-dependency-injection'
import Utilities from './../utilities/utilities';
import RpcClient from './../rpc/client'
import ProxiedObservable from './proxiedObservable'

@inject(Utilities, RpcClient, Factory.of(ProxiedObservable))
class BindingEngine {
    constructor(
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _proxiedObservableFactory: (...args: any[]) => ProxiedObservable
    ) {
        _rpc.subscribe('tapfx.bindingSync', this._onBindingSync.bind(this));
    }

    private _contextIDMap: Map<Object, string> = new Map();
    private _contextObserversMap: Map<string, ProxiedObservable[]> = new Map();

    private _onBindingSync(data): void {
        console.log('[TAP-FX] Binding sync.', data);
        let allObservers = this._contextObserversMap.get(data.contextID)
        let observer = (allObservers || []).find((i) => {
            return i.property() === data.property;
        });
        // let observer = (this._contextObserversMap.get(data.contextID) || []).find((i) => {
        //     return i.property === data.property;
        // });
        observer && observer.setValue(data.newValue);
    }

    /**
     * Associates an ID with a context.
     * @param context Context owning the observable properties.
     * @param contextID An ID to associate with the context.
     */
    resolveId(context: Object, contextID: string): void {
        if (this._contextIDMap.has(context)) {
            throw new Error('Cannot resolve ID. An ID already exists for the specified context.');
        }
        this._contextIDMap.set(context, contextID);
        this._contextObserversMap.set(contextID, []);
    }

    observe(context: Object, property: string): void {
        // if it is the first property to be observerd on the context, keep track of the context as being observed
        let contextID = this._contextIDMap.get(context);
        if (!contextID) {
            throw new Error("Missing context ID. The context ID must first be resolved before observing propertis on the context.")
        }

        // make sure the property is not currently being observed
        let existingObserverIndex = (this._contextObserversMap.get(contextID) || []).findIndex((i) => {
            return i.property() === property;
        });

        if (existingObserverIndex === -1) {
            let observer = this._proxiedObservableFactory(contextID, context, property);
            observer.observe();

            // keep track of the current observer            
            (this._contextObserversMap.get(contextID) || []).push(observer);
        }
    }
}

export default BindingEngine;
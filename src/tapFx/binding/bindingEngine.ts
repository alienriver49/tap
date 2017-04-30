import { inject, Factory } from 'aurelia-dependency-injection'
import Utilities from './../utilities/utilities';
import ProxiedObservable from './proxiedObservable'

@inject(Utilities, Factory.of(ProxiedObservable))
class BindingEngine {
    constructor(
        private _utilities: Utilities,
        private _proxiedObservableFactory: (...args: any[]) => ProxiedObservable
    ) { }

    private _contextIDMap: Map<Object, string> = new Map();
    private _contextObserversMap: Map<string, ProxiedObservable[]> = new Map();

    observe(context: Object, property: string): void {
        // if it is the first property to be observerd on the context, keep track of the context as being observed
        let contextID = this._contextIDMap.get(context);
        if (!contextID) {
            this._contextIDMap.set(context, (contextID = this._utilities.newGuid()));
            this._contextObserversMap.set(contextID, []);
        }

        // make sure the property is not currently being observed
        let existingObserverIndex = (this._contextObserversMap.get(contextID) || []).findIndex((i) => {
            return i.property() === property;
        });

        if (existingObserverIndex === -1) {
            let observer = this._proxiedObservableFactory(context, property);
            observer.observe();

            // keep track of the current observer            
            (this._contextObserversMap.get(contextID) || []).push(observer);
        }
    }
}

export default BindingEngine;
import { inject } from 'aurelia-dependency-injection'
import { ObserverLocator } from 'aurelia-binding';

@inject(ObserverLocator)
class BindingEngine {
    constructor(private _observerLocator: ObserverLocator) { }
}

export default BindingEngine;
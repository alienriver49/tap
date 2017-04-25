import Blade from './../../ux/view-models/viewModels.blade' // type only
import { inject } from 'aurelia-dependency-injection'
import { BindingEngine } from 'aurelia-binding'

@inject(BindingEngine)
class ExtensionLoaderEngine {
    private _bindingEngine: BindingEngine;

    constructor(bindingEngine: BindingEngine) {
        this._bindingEngine = bindingEngine;
    }

    addBlade(blade: Blade): void {
        console.log('now i have to add a blade', blade);
        var propertyObserver = this._bindingEngine.propertyObserver(blade, 'title');
        var subscription = propertyObserver.subscribe((newValue, oldValue) => {
            console.log('blade title has changed.... from:', oldValue, ' to:', newValue);
        });
    }
}

export default ExtensionLoaderEngine;
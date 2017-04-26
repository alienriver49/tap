import { inject } from 'aurelia-dependency-injection'
import { BindingEngine } from 'aurelia-binding'
import Blade from './../../ux/viewModels/viewModels.blade' // type only

@inject(BindingEngine)
class ExtensionLoaderEngine {
    constructor(private _bindingEngine: BindingEngine) { }

    addBlade(blade: Blade): void {
        console.log('now i have to add a blade', blade);

        var propertyObserver = this._bindingEngine
            .propertyObserver(blade, 'title')
            .subscribe((newValue, oldValue) => {
                console.log('OMG....blade title has changed.... from:', oldValue, ' to:', newValue);
            });
    }
}

export default ExtensionLoaderEngine;
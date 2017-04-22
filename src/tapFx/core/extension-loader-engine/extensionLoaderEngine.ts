import Blade from './../../ux/view-models/viewModels.blade' // type only
import { BindingEngine } from 'aurelia-binding'

class ExtensionLoaderEngine {
    constructor() { }

    addBlade(blade: Blade): void {
        console.log('now i have to add a blade', blade);
        var be = new BindingEngine();
        var subscription = be.propertyObserver(blade, 'title').subscribe((newValue, oldValue) => {
            console.log('blade title has changed.... from:', oldValue, ' to:', newValue);
        });
    }
}

export default new ExtensionLoaderEngine();
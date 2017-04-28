import { inject } from 'aurelia-dependency-injection'
import Extension from './extension'
import Blade from './../../ux/viewModels/viewModels.blade' // type only

@inject(Extension)
class ExtensionLoaderEngine {
    constructor(private _extension: Extension) { }

    addBlade(blade: Blade): void {
        console.log('now i have to add a blade', blade)
    }
}

export default ExtensionLoaderEngine;
import { inject } from 'aurelia-dependency-injection'
import ExtensionLoaderEngine from './../extension-loader-engine/extensionLoaderEngine'
import Blade from './../../ux/view-models/viewModels.blade' // type only

@inject(ExtensionLoaderEngine)
class ExtensionManager {
    private _extensionLoaderEngine: ExtensionLoaderEngine;

    constructor(extensionLoaderEngine: ExtensionLoaderEngine) {
        this._extensionLoaderEngine = extensionLoaderEngine;
    }

    addBlade(blade: Blade) {
        this._extensionLoaderEngine.addBlade(blade);
    }
}

export default ExtensionManager;
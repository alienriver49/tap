import { inject } from 'aurelia-dependency-injection'
import ExtensionLoaderEngine from './../extensionLoaderEngine/extensionLoaderEngine'
import AuthorizationEngine from './../authorizationEngine/authorizationEngine'
import Blade from './../../ux/viewModels/viewModels.blade' // type only

@inject(ExtensionLoaderEngine, AuthorizationEngine)
class ExtensionManager {
    constructor(
        private _extensionLoaderEngine: ExtensionLoaderEngine,
        private _authorizationEngine: AuthorizationEngine
    ) { }

    addBlade(blade: Blade) {
        this._extensionLoaderEngine.addBlade(blade);
    }
}

export default ExtensionManager;
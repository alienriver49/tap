import { inject } from 'aurelia-dependency-injection'
import { View} from 'aurelia-templating'
import ExtensionLoaderEngine from './../extensionLoaderEngine/extensionLoaderEngine'
import AuthorizationEngine from './../authorizationEngine/authorizationEngine'
import Blade from './../../ux/viewModels/viewModels.blade' // type only

@inject(ExtensionLoaderEngine, AuthorizationEngine)
class ExtensionManager {
    constructor(
        private _extensionLoaderEngine: ExtensionLoaderEngine,
        private _authorizationEngine: AuthorizationEngine
    ) { }

    addBlade(blade: Blade, serializedView: string) {
        // let div = document.createElement('div');
        // div.appendChild(view.fragment.cloneNode(true));
        // let serializedView = '<template>' + div.innerHTML + '</template>'; 
        this._extensionLoaderEngine.loadBlade(blade, serializedView);
    }
}

export default ExtensionManager;
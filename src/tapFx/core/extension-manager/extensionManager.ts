import ExtensionLoaderEngine from './../extension-loader-engine/extensionLoaderEngine'
import Blade from './../../ux/view-models/viewModels.blade' // type only

class ExtensionManager {
    constructor() { }

    addBlade(blade: Blade) {
        ExtensionLoaderEngine.addBlade(blade);
    }
}

export default new ExtensionManager();
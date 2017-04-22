//import Extension from './extension';
import ExtensionLoaderEngine from './../extension-loader-engine/extension-loader-engine'
import Blade from './../../ux/view-models/view-models.blade' // type only

class ExtensionManager {
    constructor() { }

    addBlade(blade: Blade) {
        ExtensionLoaderEngine.addBlade(blade);
    }
}

export default new ExtensionManager();
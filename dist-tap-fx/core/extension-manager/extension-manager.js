import ExtensionLoaderEngine from './../extension-loader-engine/extension-loader-engine';
class ExtensionManager {
    constructor() {
    }
    addBlade(blade) {
        ExtensionLoaderEngine.addBlade(blade);
    }
}
export default new ExtensionManager();

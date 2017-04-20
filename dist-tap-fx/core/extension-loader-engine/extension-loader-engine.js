import Blade from './../../ux/view-models/view-models.blade';
class ExtensionLoaderEngine {
    constructor() {
    }
    addBlade(blade) {
        var b = new Blade();
        console.log('now i have to add a blade', blade);
    }
}
export default new ExtensionLoaderEngine();

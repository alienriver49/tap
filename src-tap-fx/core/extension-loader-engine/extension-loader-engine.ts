import Blade from './../../ux/view-models/view-models.blade' // type only

class ExtensionLoaderEngine {
    constructor() { }

    addBlade(blade: Blade): void {
        console.log('now i have to add a blade', blade);
    }
}

export default new ExtensionLoaderEngine();
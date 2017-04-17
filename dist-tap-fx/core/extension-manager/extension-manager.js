import Extension from './extension';
export default class ExtensionManager {
    constructor() {
        this._extensions = {};
    }
    getExtension(id) {
        return this._extensions[id];
    }
    newExtension() {
        return new Extension();
    }
}

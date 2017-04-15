import Extension from './extension';

export default class ExtensionManager {
    constructor() { }

    private _extensions: { [id: string]: Extension } = {};

    getExtension(id: string): Extension {
        return this._extensions[id];
    }

    newExtension(): Extension {
        return new Extension();
    }
}
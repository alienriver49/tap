import Extension from './extension';
var ExtensionManager = (function () {
    function ExtensionManager() {
        this._extensions = {};
    }
    ExtensionManager.prototype.getExtension = function (id) {
        return this._extensions[id];
    };
    ExtensionManager.prototype.newExtension = function () {
        return new Extension();
    };
    return ExtensionManager;
}());
exports.default = ExtensionManager;

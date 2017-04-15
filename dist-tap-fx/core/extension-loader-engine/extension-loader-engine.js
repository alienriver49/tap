var ExtensionLoaderEngine = (function () {
    function ExtensionLoaderEngine() {
    }
    ExtensionLoaderEngine.prototype.loadExtension = function () {
        console.log('load extension');
    };
    return ExtensionLoaderEngine;
}());
exports.default = ExtensionLoaderEngine;

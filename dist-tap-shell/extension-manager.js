var ExtensionManager = (function () {
    function ExtensionManager() {
    }
    ExtensionManager.prototype.doSomething = function () {
        console.log('do something');
    };
    return ExtensionManager;
}());
export default new ExtensionManager();

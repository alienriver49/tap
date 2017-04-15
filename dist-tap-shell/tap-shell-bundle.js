var TapShell = (function () {
'use strict';

var ExtensionManager = (function () {
    function ExtensionManager() {
    }
    ExtensionManager.prototype.doSomething = function () {
        console.log('do something');
    };
    return ExtensionManager;
}());
var ExtensionManager$1 = new ExtensionManager();

var index = {
    ExtensionManager: ExtensionManager$1,
};

return index;

}());

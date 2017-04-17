var TapShell = (function () {
'use strict';

class ExtensionManager {
    constructor() {
    }
    doSomething() {
        console.log('do something');
    }
}
var ExtensionManager$1 = new ExtensionManager();

var index = {
    ExtensionManager: ExtensionManager$1,
};

return index;

}());

import ExtensionManager from './extension-manager'

var tapShell = {
    ExtensionManager: ExtensionManager
};

window['TapShell'] = tapShell;

export default tapShell;
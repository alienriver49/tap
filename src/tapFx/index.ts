import * as Utilities from './utilities/utilities'
import RpcClient from './rpc/client'
import Blade from './ux/view-models/view-models.blade'

import ExtensionManager from './core/extension-manager/extension-manager'

var tapFx = {
    Utilities: Utilities,
    Rpc: RpcClient,
    ViewModels: {
        Blade: Blade
    },
    ExtensionManager: ExtensionManager
};

window['TapFx'] = tapFx;

export default tapFx;
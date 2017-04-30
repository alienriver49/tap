import Utilities from './tapFx/utilities/utilities'
import RpcClient from './tapFx/rpc/client'
import Blade from './tapFx/ux/viewModels/viewModels.blade'
import ExtensionManager from './tapFx/core/extensionManager/extensionManager'

declare global {
    interface Window {
        TapFx: {
            Utilities: Utilities,
            Rpc: RpcClient
            ViewModels: {
                Blade: typeof Blade
            },
            ExtensionManager: ExtensionManager
        }
    }
}
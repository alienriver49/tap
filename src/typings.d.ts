import Utilities from './tapFx/utilities/utilities'
import RpcClient from './tapFx/rpc/client'
import BindingEngine from './tapFx/binding/bindingEngine'
import Blade from './tapFx/ux/viewModels/viewModels.blade'
import Extension from './tapFx/core/extension/extension'

declare global {
    interface Window {
        TapFx: {
            Utilities: Utilities,
            Rpc: RpcClient
            ViewModels: {
                Blade: typeof Blade
            },
            Extension: Extension,
            BindingEngine: BindingEngine 
        }
    }
}
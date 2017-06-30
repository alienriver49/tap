import Utilities from './tapFx/utilities/utilities'
import RpcClient from './tapFx/rpc/client'
import BindingEngine from './tapFx/binding/bindingEngine'
import BaseBlade from './tapFx/ux/viewModels/viewModels.baseBlade'
import Extension from './tapFx/core/extension/extension'
import { Aurelia, PLATFORM } from 'aurelia-framework';

declare global {
    interface Window {
        TapFx: {
            Utilities: Utilities,
            Rpc: RpcClient
            ViewModels: {
                BaseBlade: typeof BaseBlade
            },
            Extension: Extension,
            BindingEngine: BindingEngine,
            Aurelia: Aurelia
        }
    }
}
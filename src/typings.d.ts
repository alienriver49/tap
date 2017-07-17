import Utilities from './tapFx/utilities/utilities'
import RpcClient from './tapFx/rpc/client'
import {BindingEngine} from './tapFx/binding/bindingEngine'
import BaseExtension from './tapFx/core/extension/baseExtension'
import BaseBlade from './tapFx/ux/viewModels/viewModels.baseBlade'
import Extension from './tapFx/core/extension/extension'
import Http from './tapFx/core/http/http'
import Security from './tapFx/security/security'
import { Aurelia, PLATFORM } from 'aurelia-framework';

declare global {
    interface Window {
        TapFx: {
            Utilities: Utilities,
            Rpc: RpcClient
            ViewModels: {
                BaseBlade: typeof BaseBlade
            },
            BaseExtension: typeof BaseExtension,
            Extension: Extension,
            BindingEngine: BindingEngine,
            Aurelia: Aurelia,
            Http: Http,
            Security: Security
        }
    }
}
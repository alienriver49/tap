import { Utilities } from './src/fx/utilities/utilities';
import { RpcClient } from './src/fx/rpc/client';
import { BindingEngine } from './src/fx/binding/bindingEngine';
import { BaseExtension } from './src/fx/core/extension/baseExtension';
import { BaseBlade } from './src/fx/ux/viewModels/viewModels.baseBlade';
import { Extension } from './src/fx/core/extension/extension';
import { ConventionEngine } from './src/fx/ux/conventionEngine';
import { Http } from './src/fx/core/http/http';
import { Security } from './src/fx/security/security';
import { Configuration } from './src/fx/configuration/config'
import { Aurelia } from 'aurelia-framework';

declare global {
    interface ITapFx {
        Utilities: Utilities,
        Rpc: RpcClient
        Extension: Extension,
        BindingEngine: BindingEngine,
        ConventionEngine: ConventionEngine,
        Aurelia: Aurelia,
        Http: Http,
        Security: Security,
        Configuration: Configuration
    }
}
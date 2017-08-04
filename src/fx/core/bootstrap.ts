import { bootstrap } from 'aurelia-bootstrapper';
import { Aurelia } from 'aurelia-framework';
import { Utilities } from '../utilities/utilities';
import { RpcClient } from '../rpc/client';
import { BindingEngine } from '../binding/bindingEngine';
import { Security } from '../security/security';
import { ConventionEngine } from '../ux/conventionEngine';
import { BladeParser } from '../ux/bladeParser';
import { BaseBlade } from '../ux/viewModels/viewModels.baseBlade';
import { BrowseBlade } from '../ux/viewModels/viewModels.browseBlade';
import { FormBlade } from '../ux/viewModels/viewModels.formBlade';
import { Configuration } from '../configuration/config'
import { Http } from './http/http';
import { BaseExtension } from './extension/baseExtension';
import { Extension } from './extension/extension';

export interface ITapFx {
    Utilities: Utilities;
    Rpc: RpcClient;
    BindingEngine: BindingEngine;
    Extension: Extension;
    ConventionEngine: ConventionEngine;
    Aurelia: Aurelia;
    Http: Http;
    Security: Security;
    Configuration: Configuration;
}

/**
 * Storage of the tapFx resources set during bootstrapping.
 */
let tapFx: ITapFx;

/**
 * Bootstrap the tap framework.
 */
export function init(): Promise<ITapFx> {
    return new Promise<ITapFx>((resolve, reject) => {
        bootstrap((aurelia: Aurelia) => {
            console.log('[TAP-FX] Bootstrapping framework');

            aurelia.container.registerSingleton(Utilities, Utilities);
            aurelia.container.registerSingleton(RpcClient, RpcClient);
            aurelia.container.registerSingleton(BindingEngine, BindingEngine);
            aurelia.container.registerSingleton(Extension, Extension);
            aurelia.container.registerSingleton(BladeParser, BladeParser);
            aurelia.container.registerSingleton(ConventionEngine, ConventionEngine);
            aurelia.container.registerSingleton(Http, Http);
            aurelia.container.registerSingleton(Security, Security);
            aurelia.container.registerSingleton(Configuration, Configuration);

            // TODO: how can we expose things to the shell, but not extensions? i.e. things like Rpc, BindingEngine, ConventionEngine shouldn't be exposed to extension developers right away
            tapFx = {
                Utilities: aurelia.container.get(Utilities),
                Rpc: aurelia.container.get(RpcClient),
                BindingEngine: aurelia.container.get(BindingEngine),
                Extension: aurelia.container.get(Extension),
                ConventionEngine: aurelia.container.get(ConventionEngine),
                Aurelia: aurelia,
                Http: aurelia.container.get(Http),
                Security: aurelia.container.get(Security),
                Configuration: aurelia.container.get(Configuration)
            };

            resolve(tapFx);
        });
    });
}

/**
 * Get the tap framework.
 */
export function getTapFx(): ITapFx {
    if (!tapFx) {
        throw Error('TapFx not yet bootstrapped, please call this function within init().then resolution.');
    }

    return tapFx;
}

/**
 * TapFx view models.
 */
export class ViewModels {
    public static BaseBlade = BaseBlade;
    public static BrowseBlade = BrowseBlade;
    public static FormBlade = FormBlade;
}

/**
 * Base extension class.
 */
export { BaseExtension } from './extension/baseExtension';

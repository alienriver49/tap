/// <reference path="./../typings.d.ts" />

import { bootstrap } from 'aurelia-bootstrapper'
import { Aurelia } from 'aurelia-framework';
import Utilities from './utilities/utilities'
import RpcClient from './rpc/client'
import BindingEngine from './binding/bindingEngine'
import Extension from './core/extension/extension'
import BladeParser from './ux/bladeParser'
import ConventionEngine from './ux/conventionEngine'
import Http from './core/http/http'
import Security from './security/security'
import BaseExtension from './core/extension/baseExtension'

import BaseBlade from './ux/viewModels/viewModels.baseBlade'
import BrowseBlade from './ux/viewModels/viewModels.browseBlade'
import FormBlade from './ux/viewModels/viewModels.formBlade'

/**
 * Storage of the tapFx resources set during bootstrapping.
 */
let tapFx: ITapFx;

/**
 * Bootstrap the tap framework.
 */
export let init = (): Promise<ITapFx> => {
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

            // TODO: how can we expose things to the shell, but not extensions? i.e. things like Rpc, BindingEngine, ConventionEngine shouldn't be exposed to extension developers right away
            tapFx = {
                Utilities: aurelia.container.get(Utilities),
                Rpc: aurelia.container.get(RpcClient),
                BindingEngine: aurelia.container.get(BindingEngine),
                Extension: aurelia.container.get(Extension),
                ConventionEngine: aurelia.container.get(ConventionEngine),
                Aurelia: aurelia,
                Http: aurelia.container.get(Http),
                Security: aurelia.container.get(Security)
            };

            resolve(tapFx);
        });
    });
};

/**
 * Get the tap framework.
 */
export function getTapFx(): ITapFx {
    if (!tapFx)
        throw Error('TapFx not yet bootstrapped, please call this function within init().then resolution.');

    return tapFx;
}

/**
 * TapFx view models.
 */
export let ViewModels = {
    BaseBlade: BaseBlade,
    BrowseBlade: BrowseBlade,
    FormBlade: FormBlade,
}

/**
 * Base extension class.
 */
export {BaseExtension} from './core/extension/baseExtension';
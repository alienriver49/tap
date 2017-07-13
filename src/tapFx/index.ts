/// <reference path="./../typings.d.ts" />

import { bootstrap } from 'aurelia-bootstrapper'
import { Aurelia } from 'aurelia-framework';
import { BindingLanguage } from 'aurelia-templating'; // TODO: can this be removed?
import { TemplatingBindingLanguage } from 'aurelia-templating-binding' // TODO: can this be removed?
import Utilities from './utilities/utilities'
import RpcClient from './rpc/client'
import {BindingEngine} from './binding/bindingEngine'
import BaseBlade from './ux/viewModels/viewModels.baseBlade'
import BaseExtension from './core/extension/baseExtension'
import Extension from './core/extension/extension'
import Auth from './security/auth'
import BladeParser from './ux/bladeParser'
import ConventionEngine from './ux/conventionEngine'

// Bootstrap function is called before any Aurelia 'configure' convention startup
bootstrap((aurelia: Aurelia) => {
    aurelia.container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
    aurelia.container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
    aurelia.container.registerSingleton(Utilities, Utilities);
    aurelia.container.registerSingleton(RpcClient, RpcClient);
    aurelia.container.registerSingleton(BindingEngine, BindingEngine);
    aurelia.container.registerSingleton(Extension, Extension);
    aurelia.container.registerSingleton(Auth, Auth);
    aurelia.container.registerSingleton(BladeParser, BladeParser);
    aurelia.container.registerSingleton(ConventionEngine, ConventionEngine);

    let tapFx = {
        Utilities: aurelia.container.get(Utilities),
        Rpc: aurelia.container.get(RpcClient),
        BindingEngine: aurelia.container.get(BindingEngine),
        ViewModels: {
            BaseBlade: BaseBlade
        },
        BaseExtension: BaseExtension,
        Extension: aurelia.container.get(Extension),
        Aurelia: aurelia,
        Auth: aurelia.container.get(Auth),
    };
    window.TapFx = tapFx;

    // Once window.TapFx is initialized, dispatch the TapFxReady event
    // The main app should check for the existence of window.TapFx or listen for this event
    document.dispatchEvent(
        new CustomEvent('TapFxReady', {
            bubbles: true
        })
    );
});
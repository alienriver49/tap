/// <reference path="./../typings.d.ts" />

import Utilities from './utilities/utilities'
import RpcClient from './rpc/client'
import {BindingEngine} from './binding/bindingEngine'
import Extension from './core/extension/extension'
import { Aurelia } from 'aurelia-framework'; // type only
import BaseBlade from './ux/viewModels/viewModels.baseBlade'
import { bootstrap } from 'aurelia-bootstrapper'
import {BindingLanguage } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import Auth from './security/auth'

// Bootstrap function is called before any Aurelia 'configure' convention startup
bootstrap((aurelia: Aurelia) => {
    aurelia.container.registerSingleton(Utilities, Utilities);
    aurelia.container.registerSingleton(RpcClient, RpcClient);
    aurelia.container.registerSingleton(BindingEngine, BindingEngine);
    aurelia.container.registerSingleton(Extension, Extension);
    aurelia.container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
    aurelia.container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
    aurelia.container.registerSingleton(Auth, Auth);

    let tapFx = {
        Utilities: aurelia.container.get(Utilities),
        Rpc: aurelia.container.get(RpcClient),
        BindingEngine: aurelia.container.get(BindingEngine),
        ViewModels: {
            BaseBlade: BaseBlade
        },
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
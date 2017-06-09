/// <reference path="./../typings.d.ts" />

import Utilities from './utilities/utilities'
import RpcClient from './rpc/client'
import BindingEngine from './binding/bindingEngine'
import AuthorizationEngine from './core/authorizationEngine/authorizationEngine'
import Extension from './core/extension/extension'
import Blade from './ux/viewModels/viewModels.blade'
import { bootstrap } from 'aurelia-bootstrapper'
import {BindingLanguage } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'

bootstrap(aurelia => {
    aurelia.container.registerSingleton(Utilities, Utilities);
    aurelia.container.registerSingleton(RpcClient, RpcClient);
    aurelia.container.registerSingleton(BindingEngine, BindingEngine);
    aurelia.container.registerSingleton(AuthorizationEngine, AuthorizationEngine);
    aurelia.container.registerSingleton(Extension, Extension);
	aurelia.container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
	aurelia.container.registerAlias(BindingLanguage, TemplatingBindingLanguage);

    aurelia.start().then((a) => {
        let tapFx = {
            Utilities: aurelia.container.get(Utilities),
            Rpc: aurelia.container.get(RpcClient),
            ViewModels: {
                Blade: Blade
            },
            Extension: aurelia.container.get(Extension)
        };
        window.TapFx = tapFx;
    });
});
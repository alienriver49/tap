import Utilities from './utilities/utilities'
import RpcClient from './rpc/client'
import BindingEngine from './binding/bindingEngine'
import ExtensionManager from './core/extensionManager/extensionManager'
import AuthorizationEngine from './core/authorizationEngine/authorizationEngine'
import ExtensionLoaderEngine from './core/extensionLoaderEngine/extensionLoaderEngine'
import Extension from './core/extensionLoaderEngine/extension'
import Blade from './ux/viewModels/viewModels.blade'
import { bootstrap } from 'aurelia-bootstrapper'

bootstrap(aurelia => {
    aurelia.container.registerSingleton(Utilities, Utilities);
    aurelia.container.registerSingleton(RpcClient, RpcClient);
    aurelia.container.registerSingleton(BindingEngine, BindingEngine);
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerSingleton(AuthorizationEngine, AuthorizationEngine);
    aurelia.container.registerSingleton(ExtensionLoaderEngine, ExtensionLoaderEngine);
    aurelia.container.registerSingleton(Extension, Extension);

    aurelia.start().then((a) => {
        let tapFx = {
            Utilities: aurelia.container.get(Utilities),
            Rpc: aurelia.container.get(RpcClient),
            ViewModels: {
                Blade: Blade
            },
            ExtensionManager: aurelia.container.get(ExtensionManager)
        };
        window['TapFx'] = tapFx;
    });
});
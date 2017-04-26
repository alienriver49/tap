import Utilities from './utilities/utilities'
import RpcClient from './rpc/client'
import ExtensionManager from './core/extensionManager/extensionManager'
import Blade from './ux/viewModels/viewModels.blade'
import { bootstrap } from 'aurelia-bootstrapper'

bootstrap(aurelia => {
    aurelia.container.registerSingleton(Utilities, Utilities);
    aurelia.container.registerSingleton(RpcClient, RpcClient);
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);

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
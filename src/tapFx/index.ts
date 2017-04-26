// import container from './diContainer'
// import ExtensionManager from './core/extensionManager/extensionManager'
// import RpcClient from './rpc/client'
// import Blade from './ux/viewModels/viewModels.blade'
// import * as Utilities from './utilities/utilities'

// container.registerSingleton(ExtensionManager, ExtensionManager);
// container.registerSingleton(RpcClient, RpcClient);

// var tapFx = {
//     Utilities: Utilities,
//     Rpc: container.get(RpcClient),
//     ViewModels: {
//         Blade: Blade
//     },
//     ExtensionManager: container.get(ExtensionManager)
// };

// window['TapFx'] = tapFx;

// export default tapFx;

import ExtensionManager from './core/extensionManager/extensionManager'
import RpcClient from './rpc/client'
import Blade from './ux/viewModels/viewModels.blade'
import * as Utilities from './utilities/utilities'
import { bootstrap } from 'aurelia-bootstrapper'

bootstrap(aurelia => {
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerSingleton(RpcClient, RpcClient);

    aurelia.start().then((a) => {
        window['TapFx'] = {
            Utilities: Utilities,
            Rpc: aurelia.container.get(RpcClient),
            ViewModels: {
                Blade: Blade
            },
            ExtensionManager: aurelia.container.get(ExtensionManager)
        };
    });
});
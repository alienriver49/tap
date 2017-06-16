/// <reference path="./../typings.d.ts" />
import { Aurelia, PLATFORM } from 'aurelia-framework';
import BindingEngine from './../tapFx/binding/bindingEngine'
import {RpcClient} from './../tapFx/rpc/client'
import CommandManager from './commanding/commandManager'
import ExtensionManager from './extensionManager'
import ExtensionLoaderEngine from './extensionLoaderEngine'
import ConventionEngine from './conventionEngine'


export function configure(aurelia: Aurelia) {
    // The app and tapFx have separate instances of Aurelia,
    // Use singletons from TapFx in the app
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerInstance(BindingEngine, window.TapFx.BindingEngine)
    aurelia.container.registerInstance(RpcClient, window.TapFx.Rpc)
    aurelia.container.registerSingleton(CommandManager, CommandManager);
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerSingleton(ExtensionLoaderEngine, ExtensionLoaderEngine);
    aurelia.container.registerSingleton(ConventionEngine, ConventionEngine);

    aurelia.use
        .basicConfiguration()
        .history()
        .developmentLogging();

    aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app/app')));
}

// Attempt to share just one instance of Aurelia with Tap-Fx
// (It never quite worked)
// (function (tapFx){
//     if (!tapFx)
//         document.addEventListener("TapFxReady", (e) => {
//             var dmf = e;
//             initialize(window.TapFx.Aurelia);
//             delete(window.TapFx.Aurelia);
//         });
//     else{
//         initialize(window.TapFx.Aurelia);
//         delete(window.TapFx.Aurelia);
//     }

// })(window.TapFx)

// function initialize(aurelia: Aurelia) : void {
//     aurelia.host = document.body;
//     aurelia.container.registerSingleton(CommandManager, CommandManager);
//     aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
//     aurelia.container.registerSingleton(ExtensionLoaderEngine, ExtensionLoaderEngine);
//     aurelia.container.registerSingleton(ConventionEngine, ConventionEngine);

//     aurelia.use
//         .basicConfiguration()
//         .history()
//         .developmentLogging();

//     aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app/app'), document.body));
//     window.TapFx.BootstrapResolve(undefined);
// }
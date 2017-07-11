/// <reference path="./../typings.d.ts" />
import { Aurelia, PLATFORM, FrameworkConfiguration } from 'aurelia-framework';
import {BindingEngine} from './../tapFx/binding/bindingEngine'
import {RpcClient} from './../tapFx/rpc/client'
import CommandManager from './commanding/commandManager'
import ExtensionManager from './extensionManagement/extensionManager'
import ExtensionLoaderEngine from './extensionManagement/extensionLoaderEngine'
import ConventionEngine from './extensionManagement/conventionEngine'
import {LogManager} from "aurelia-framework";
import {ConsoleAppender} from "aurelia-logging-console";
import config from './authConfig';
import {AuthService} from "aurelia-auth";
//import 'material-components-web'

// LogManager.addAppender(new ConsoleAppender());
// LogManager.setLevel(LogManager.logLevel.debug);

// export async function configure(aurelia: Aurelia) {

//     // The app and tapFx have separate instances of Aurelia,
//     // Use singletons from TapFx in the app
//     aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
//     aurelia.container.registerInstance(BindingEngine, window.TapFx.BindingEngine)
//     aurelia.container.registerInstance(RpcClient, window.TapFx.Rpc)
//     aurelia.container.registerSingleton(CommandManager, CommandManager);
//     aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
//     aurelia.container.registerSingleton(ExtensionLoaderEngine, ExtensionLoaderEngine);
//     aurelia.container.registerSingleton(ConventionEngine, ConventionEngine);

//     aurelia.use
//         .basicConfiguration()
//         .history()
//         // Register the components globally so we don't need to
//         // 'require' them in each html (useful when dynamically creating views)
//         .feature(PLATFORM.moduleName('webComponents/index'))        
//         .developmentLogging()

//     await aurelia.start();
//     aurelia.setRoot(PLATFORM.moduleName('app/app'));

// }

// Attempt to share just one instance of Aurelia with Tap-Fx
// (It never quite worked)
(function (tapFx){
    if (!tapFx)
        document.addEventListener("TapFxReady", (e) => {
            initialize(window.TapFx.Aurelia);
            delete(window.TapFx.Aurelia);
        });
    else{
        initialize(window.TapFx.Aurelia);
        delete(window.TapFx.Aurelia);
    }

})(window.TapFx)

function initialize(aurelia: Aurelia) : void {
    aurelia.host = document.body;
    // The app and tapFx have separate instances of Aurelia,
    // Use singletons from TapFx in the app
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerSingleton(CommandManager, CommandManager);
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerSingleton(ExtensionLoaderEngine, ExtensionLoaderEngine);
    aurelia.container.registerSingleton(ConventionEngine, ConventionEngine);

    aurelia.use
        .standardConfiguration()
        .history()
        // Register the components globally so we don't need to
        // 'require' them in each html (useful when dynamically creating views)
        .feature(PLATFORM.moduleName('webComponents/index'))        
        .developmentLogging()
        .plugin(PLATFORM.moduleName('aurelia-auth'), (baseConfig) => {
            baseConfig.configure(config);
        });

    let auth: AuthService = aurelia.container.get(AuthService);
    let userData: any = {};

    aurelia.start().then(() => {
        if (auth.isAuthenticated()) {
            console.log('[SHELL] Authenticated!: ', auth.getTokenPayload());
            aurelia.setRoot(PLATFORM.moduleName('app/app'));
        }
        else {
            console.log('[SHELL] Not authenticated!');
            auth.authenticate('TylerId', false, userData);
        }
    });

    // aurelia.container.registerSingleton(CommandManager, CommandManager);
    // aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    // aurelia.container.registerSingleton(ExtensionLoaderEngine, ExtensionLoaderEngine);
    // aurelia.container.registerSingleton(ConventionEngine, ConventionEngine);

    //window.TapFx.BootstrapResolve(undefined);
}
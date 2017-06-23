/// <reference path="./../typings.d.ts" />
import { Aurelia, PLATFORM, FrameworkConfiguration } from 'aurelia-framework';
import BindingEngine from './../tapFx/binding/bindingEngine'
import {RpcClient} from './../tapFx/rpc/client'
import CommandManager from './commanding/commandManager'
import ExtensionManager from './extensionManagement/extensionManager'
import ExtensionLoaderEngine from './extensionManagement/extensionLoaderEngine'
import ConventionEngine from './extensionManagement/conventionEngine'
import {LogManager} from "aurelia-framework";
import {ConsoleAppender} from "aurelia-logging-console";
//import 'material-components-web'

// LogManager.addAppender(new ConsoleAppender());
// LogManager.setLevel(LogManager.logLevel.debug);

export async function configure(aurelia: Aurelia) {

    // Register WebComponents
    // Material components with Aurelia wrappers
    // and custom components
    const components = [
        PLATFORM.moduleName('webComponents/button/mdc-button'),
        PLATFORM.moduleName('webComponents/checkbox/mdc-checkbox'),
        PLATFORM.moduleName('webComponents/ripple/mdc-ripple'),
        PLATFORM.moduleName('webComponents/tapComponents/tap-test-component')
    ];

    // Register the components globally so we don't need to
    // 'require' them in each html (useful when dynamically creating views)
    // Would like to use the FrameworkConfiguration.feature functionality
    // commented out below, but can't seem to get it to work 
    // because it appends an 'index' to the module Id that it tries to load
    // and it's not working with webpack as setup
    aurelia.use.globalResources(components);

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
        //.feature('webComponents')
        .developmentLogging()

    await aurelia.start();
    aurelia.setRoot(PLATFORM.moduleName('app/app'));

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
/// <reference path="./../typings.d.ts" />
import { Aurelia, PLATFORM } from 'aurelia-framework';
import BindingEngine from './../tapFx/binding/bindingEngine'
import {RpcClient} from './../tapFx/rpc/client'
import ExtensionManager from './extensionManager'
import CommandManager from './commandManager'

export function configure(aurelia: Aurelia) {
    // The app and tapFx have separate instances of Aurelia,
    // Use singletons from TapFx in the app
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerInstance(BindingEngine, window.TapFx.BindingEngine)
    aurelia.container.registerInstance(RpcClient, window.TapFx.Rpc)
    aurelia.container.registerSingleton(CommandManager, CommandManager);

    aurelia.use
        .basicConfiguration()
        .history()
        .developmentLogging();

    aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app/app')));
}

import { Aurelia, PLATFORM } from 'aurelia-framework';
import BindingEngine from './../tapFx/binding/bindingEngine'
import CommandManager from './commanding/commandManager'
import ExtensionManager from './extensionManager'
import ExtensionLoaderEngine from './extensionLoaderEngine'
import ConventionEngine from './conventionEngine'


export function configure(aurelia: Aurelia) {
    aurelia.container.registerSingleton(BindingEngine, BindingEngine);
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

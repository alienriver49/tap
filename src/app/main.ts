import { Aurelia, PLATFORM } from 'aurelia-framework';
import BindingEngine from './../tapFx/binding/bindingEngine'
import ExtensionManager from './extensionManager'
import CommandManager from './commandManager'

export function configure(aurelia: Aurelia) {
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerSingleton(BindingEngine, BindingEngine);
    aurelia.container.registerSingleton(CommandManager, CommandManager);

    aurelia.use
        .basicConfiguration()
        .history()
        .developmentLogging();

    aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app/app')));
}

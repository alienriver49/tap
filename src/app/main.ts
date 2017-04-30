import { Aurelia, PLATFORM } from 'aurelia-framework';
import BindingEngine from './../tapFx/binding/bindingEngine'
import ExtensionManager from './extensionManager'

export function configure(aurelia) {
    aurelia.container.registerSingleton(ExtensionManager, ExtensionManager);
    aurelia.container.registerSingleton(BindingEngine, BindingEngine);

    aurelia.use
        .standardConfiguration()
        .developmentLogging();

    aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app/app')));
}

import { inject } from 'aurelia-framework'
import ExtensionManager from './extensionManager'

@inject(ExtensionManager)
export class App {
    constructor(public extensionManager: ExtensionManager) { }

    loadExtension(id: number): void {
        console.log('[SHELL] Start loading extension: ', id);
        this.extensionManager.loadExtension(id).then((extensionID) => {
            console.log('[SHELL] Finish loading extension: ', id, ' with (ID): ', extensionID);
            console.log('');
        });
    }
}
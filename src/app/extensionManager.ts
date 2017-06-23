import { inject, Factory, computedFrom } from 'aurelia-framework'
import ExtensionLoaderEngine from './extensionLoaderEngine'
import Extension from './extension'
import DeferredPromise from './deferredPromise'
import {PortalBlade, IPortalBladeConfig} from './viewModels.portalBlade'

@inject(ExtensionLoaderEngine, Factory.of(Extension))
class ExtensionManager {
    constructor(
        private _extensionLoaderEngine: ExtensionLoaderEngine,
        private _extensionFactory: (...args: any[]) => Extension
    ) {
        let subscription = window.TapFx.Rpc.subscribe('tapfx.newBlade', this._onNewBlade.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = window.TapFx.Rpc.subscribe('shell.removeExtension', this._onRemoveExtension.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    private _unloadExtensionPromise: DeferredPromise<string>;
    private _rpcSubscriptions: any[] = [];
    extensions: Extension[] = [];

    /**
     * Adds a new blade for an extension.
     * @param data
     */
    private _onNewBlade(data: any): void {
        console.log('[SHELL] Received newBlade message: ', data);
        let extension = this.extensions.find((ext) => {
            return ext.id === data.extensionId;
        });
        if (extension) {
            // add the blade to the extension
            let bladeConfig: IPortalBladeConfig = {
                bladeId: data.bladeId,
                serializedBlade: data.serializedBlade,
                viewName: data.viewName,
                functions: data.functions
            };
            let blade = extension.addBlade(bladeConfig);

            // let's check if we can activate:
            // if the canActivate function is not defined, true by default.
            // if the canActivate function is defined we will get the result from it
            let canActivate = !(blade.canActivate) || (blade.canActivate && blade.canActivate());
            if (canActivate) {
                // if the result was a boolean
                if (canActivate === true) {
                    // load the view for that blade
                    blade.addView();
                    if (blade.activate) blade.activate();
                } else {
                    // otherwise, it was a promise we will resolve and determine the resule of
                    canActivate.then((result) => {
                        if (result) {
                            if (result) {
                                // load the view for that blade
                                if (extension) 
                                    blade.addView();
                                if (blade.activate) 
                                    blade.activate();
                            }
                        }
                    });
                }
            } 
        }
    }

    /**
     * Removes an extension from the shell.
     * @param data 
     */
    private _onRemoveExtension(data: any): void {
        console.log('[SHELL] Received removeExtension message: ', data);
        let extensionIndex = this.extensions.findIndex((ext) => {
            return ext.id === data.extensionId;
        });
        if (extensionIndex !== -1) {
            let extension = this.extensions[extensionIndex];
            // remove the extension's blades
            extension.removeBlades();

            // remove the iframe element
            var iFrameElement = document.getElementById(extension.id);
            if (iFrameElement) iFrameElement.remove();

            // remove the extension
            this.extensions.splice(extensionIndex);

            console.log('[SHELL] Finish unloading extension: ' + extension.name);
            this._unloadExtensionPromise.resolve("extension unloaded");
        } else {
            this._unloadExtensionPromise.reject("extension unload failed: extension not found");
        }
    }

    /**
     * Handles the loading of an extension.
     * @param extensionName 
     * @param params 
     * @param queryParams 
     */
    loadExtension(extensionName: string, params: any[], queryParams: Object): Promise<string> {
        return new Promise<string>((resolve) => {
            this._extensionLoaderEngine.loadExtension(extensionName).then((extensionId) => {
                this.extensions.push(this._extensionFactory(extensionId, extensionName));

                resolve(extensionId);
            });
        });
    }

    // TODO: Stubbed for now.
    updateExtensionParams(extensionName: string, params: any[], queryParams: Object): Promise<string> {
        return new Promise<string>((resolve) => {
            // Need to ensure passed extension is loaded

            // Update params for that extension

            console.log('[SHELL] Finish updating extension: ' + extensionName);
            resolve("extension params updated");
        });
    }

    /**
     * Handles the unloading of an extension.
     * @param extensionName 
     */
    unloadExtension(extensionName: string): Promise<string> {
        this._unloadExtensionPromise = new DeferredPromise<string>();

        let extension = this.extensions.find((ext) => {
            return ext.name === extensionName;
        });

        if (!extension) {
            this._unloadExtensionPromise.reject("extension unload failed: extension hasn't been loaded yet");
        } else {
            // communication from the shell to tapfx uses tapfx.removeExtension
            window.TapFx.Rpc.publish('tapfx.removeExtension', extension.id);
            // TODO: implement timing out of an extension, if an extension takes to long to respond, we will remove it regardless
        }

        return this._unloadExtensionPromise.promise;
    }
}

export default ExtensionManager;
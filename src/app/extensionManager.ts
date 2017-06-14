import { inject, Factory, computedFrom } from 'aurelia-framework'
import Extension from './extension'
import DeferredPromise from './deferredPromise'

@inject(Factory.of(Extension))
class ExtensionManager {
    constructor(private _extensionFactory: (...args: any[]) => Extension) {
        let subscription = window.TapFx.Rpc.subscribe('tapfx.newBlade', this._onNewBlade.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = window.TapFx.Rpc.subscribe('shell.removeExtension', this._onRemoveExtension.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    private _unloadExtensionPromise: DeferredPromise<string>;
    private _rpcSubscriptions: any[] = [];

    private _onNewBlade(data: any): void {
        console.log('[SHELL] Received newBlade message: ', data);
        let extension = this.extensions.find((ext) => {
            return ext.id === data.extensionId;
        });
        if (extension)
            extension.addBlade(data.bladeId, data.serializedBlade, data.viewName, data.functions); 
    }

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

    extensions: Extension[] = [];

    loadExtension(extensionName: string, params: any[], queryParams: Object): Promise<string> {
        return new Promise<string>((resolve) => {
            let extensionScripts = [
                'common-bundle.js',
                'tapFx-bundle.js'
            ];

            switch (extensionName) {
                case 'ext1':
                    extensionScripts.push('tapExt1-bundle.js');
                    break;
                case 'ext2':
                    extensionScripts.push('tapExt2-bundle.js');
                    break;
                default: throw new Error('Unknown extension specified.');
            }

            let extensionID = window.TapFx.Utilities.newGuid();

            let iFrame = document.createElement('iframe');
            iFrame.setAttribute('id', extensionID);
            iFrame.setAttribute('src', 'about:blank');

            let iFramesEl = document.getElementById('extension-iframes');
            if (iFramesEl) {
                iFramesEl.appendChild(iFrame);
            }

            iFrame.setAttribute('sandbox', '');

            extensionScripts.forEach((script: string, index: number, array: string[]) => {
                // temp fix: loading every 100ms so that there is enough time for scripts to load
                setTimeout(() => {
                    console.log('[SHELL] Loading:', script);
                    let scriptTag = iFrame.contentWindow.document.createElement('script');
                    scriptTag.setAttribute('type', 'text/javascript');
                    scriptTag.setAttribute('src', script);
                    iFrame.contentWindow.document.body.appendChild(scriptTag);

                    if (index === array.length - 1) {
                        this.extensions.push(this._extensionFactory(extensionID, extensionName));

                        console.log('[SHELL] Finish loading extension: ' + extensionName + ' with (ID): ', extensionID);
                        resolve(extensionID);
                    }
                }, 100 * index);
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
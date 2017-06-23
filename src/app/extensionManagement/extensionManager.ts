import { inject, Factory, computedFrom } from 'aurelia-framework'
import { ExtensionCommandResult, ExtensionCommandQueue }  from './extensionCommandQueue'
import ExtensionLoaderEngine from './extensionLoaderEngine'
import Extension from './extension'
//import DeferredPromise from './../deferredPromise'
import {PortalBlade, IPortalBladeConfig} from './viewModels.portalBlade'

@inject(ExtensionCommandQueue, ExtensionLoaderEngine, Factory.of(Extension))
class ExtensionManager {
    constructor(
        private _extensionCommandQueue: ExtensionCommandQueue,
        private _extensionLoaderEngine: ExtensionLoaderEngine,
        private _extensionFactory: (...args: any[]) => Extension
    ) {
        let subscription = window.TapFx.Rpc.subscribe('shell.addBlade', this._onAddBlade.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = window.TapFx.Rpc.subscribe('shell.addBladeFailed', this._onAddBladeFailed.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = window.TapFx.Rpc.subscribe('shell.removeExtension', this._onRemoveExtension.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    private _rpcSubscriptions: any[] = [];
    extensions: Extension[] = [];

    /**
     * Adds a blade for an extension.
     * @param data
     */
    private _onAddBlade(data: any): void {
        console.log('[SHELL] Received addBlade message: ', data);
        let extensionId = data.extensionId;
        let extension = this._findExtension(extensionId);
        if (extension) {
            // add the blade to the extension
            let bladeConfig: IPortalBladeConfig = {
                bladeId: data.bladeId,
                serializedBlade: data.serializedBlade,
                viewName: data.viewName,
                functions: data.functions
            };
            // add the blade to the extension
            let blade = extension.addBlade(bladeConfig);
            blade.addView();

            // since we know the current command is the extension load command, we will resolve this one. for now, this works since commands are sequential and we know to only call this when appropriate
            let defer = this._extensionCommandQueue.current.defer;
            if (defer) defer.resolve({ successful: true, message: 'extension loaded'});
        }
    }

    /**
     * Adding a blade failed so handle accordingly.
     * @param data
     */
    private _onAddBladeFailed(data: any): void {
        console.log('[SHELL] Received addBladeFailed message: ', data);
        let extensionId = data.extensionId;
        let extension = this._findExtension(extensionId);
        if (extension) {
            // if the extension has no blades then that means we just want to remove it (usually a case on initial load)
            if (extension.blades.length === 0) {
                this.extensions.splice(this._findExtensionIndex(extensionId));

                // TODO: research resolving vs. rejecting
                let defer = this._extensionCommandQueue.current.defer;
                if (defer) defer.resolve({ successful: false, message: 'extension load failed'});
            }
        }
    }

    /**
     * Removes an extension from the shell.
     * @param data 
     */
    private _onRemoveExtension(data: any): void {
        console.log('[SHELL] Received removeExtension message: ', data);
        let extensionId = data.extensionId;
        let extension = this._findExtension(extensionId);
        let defer = this._extensionCommandQueue.current.defer;
        if (extension) {
            // unload the extension
            this._extensionLoaderEngine.unloadExtension(extension);

            // remove the extension
            this.extensions.splice(this._findExtensionIndex(extensionId));

            console.log('[SHELL] Finish unloading extension: ' + extension.name);
            if (defer) defer.resolve({ successful: true, message: 'extension unloaded'});
        } else {
            if (defer) defer.resolve({ successful: false, message: 'extension unload failed: extension not found'});
        }
    }

    /**
     * Handles the loading of an extension.
     * @param extensionName 
     * @param params 
     * @param queryParams 
     */
    loadExtension(extensionName: string, params: any[], queryParams: Object): void {
        // get a new extension id
        let extensionId = window.TapFx.Utilities.newGuid();
        this._extensionCommandQueue.queueCommand(extensionId, () => {
            this._extensionLoaderEngine.loadExtension(extensionId, extensionName).then((result) => {
                this.extensions.push(this._extensionFactory(extensionId, extensionName));
            });
        });
    }

    // TODO: Stubbed for now.
    updateExtensionParams(extensionName: string, params: any[], queryParams: Object): void {
        let extension = this._findExtensionByName(extensionName);
        if (extension) {
            let extensionId = extension.id;
            this._extensionCommandQueue.queueCommand(extensionId, () => {
                // Update params for that extension

                let defer = this._extensionCommandQueue.current.defer;
                if (defer) defer.resolve({ successful: true, message: 'extension params updated'});
            });
        } else {
            // we could be 
        }
    }

    /**
     * Handles the unloading of an extension.
     * @param extensionName 
     */
    unloadExtension(extensionName: string):void {
        let extension = this._findExtensionByName(extensionName);
        if (extension) {
            let extensionId = extension.id;
            this._extensionCommandQueue.queueCommand(extensionId, () => {
                window.TapFx.Rpc.publish('tapfx.removeExtension', extensionId);
            });
        } else {
            // 
        }
    }

    /**
     * Find the index of an extension in the extensions array using it's id.
     * @param extensionId 
     */
    private _findExtensionIndex(extensionId: string): number {
        return this.extensions.findIndex((ext) => {
            return ext.id === extensionId;
        });
    }

    /**
     * Find an extension using it's id.
     * @param extensionId 
     * @returns The extension or null if no extension was found.
     */
    private _findExtension(extensionId: string): Extension | undefined {
        return this.extensions.find((ext) => {
            return ext.id === extensionId;
        });
    }

    /**
     * Find an extension using it's id.
     * @param extensionId 
     * @returns The extension or null if no extension was found.
     */
    private _findExtensionByName(extensionName: string): Extension | undefined {
        return this.extensions.find((ext) => {
            return ext.name === extensionName;
        });
    }
}

export default ExtensionManager;
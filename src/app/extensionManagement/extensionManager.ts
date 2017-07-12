import { inject, Factory } from 'aurelia-framework'
import { EventAggregator } from 'aurelia-event-aggregator';
import { ExtensionCommandResult, ExtensionCommandQueue }  from './extensionCommandQueue'
import ExtensionLoaderEngine from './extensionLoaderEngine'
import Extension from './extension'
import {PortalBlade, IPortalBladeConfig} from './viewModels.portalBlade'

@inject(EventAggregator, ExtensionCommandQueue, ExtensionLoaderEngine, Factory.of(Extension))
class ExtensionManager {
    constructor(
        private _eventAggregator: EventAggregator,
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

        subscription = window.TapFx.Rpc.subscribe('shell.removeExtensionFailed', this._onRemoveExtensionFailed.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = window.TapFx.Rpc.subscribe('shell.removeBlade', this._onRemoveBlade.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    /**
     * RPC subscriptions the extension manager is currently subscribed to.
     */
    private _rpcSubscriptions: any[] = [];

    /**
     * Loaded extensions currently being managed by the extension manager.
     */
    extensions: Extension[] = [];

    /**
     * Maps extension names to their ids. This gets set when the load command is received and the key is removed when the unload command is received.
     */
    private _extensionIdMap: Map<string, string> = new Map();

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
                functions: data.functions,
                serializedView: data.view
            };
            // add the blade to the extension
            let blade = extension.addBlade(bladeConfig);

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
            // if the extension has no blades then that means we just want to remove it. this would most likely be a case where the initial blade of the extension failed to load, which would mean the extension failed to load.
            if (extension.blades.length === 0) {
                // remove the extension
                this._performRemoveExtension(extension);

                // TODO: research resolving vs. rejecting
                let defer = this._extensionCommandQueue.current.defer;
                if (defer) defer.resolve({ successful: false, message: 'extension load failed'});

                // since the extension failed to load we will clear the queue and reroute to the portal index. note: this could go to the previous extension in the future
                let urlFragment = '/';
                this._extensionCommandQueue.clear();
                this._eventAggregator.publish('shell.router.reroute', { urlFragment: urlFragment });
            }
        }
    }

    /**
     * Function called from the remove extension RPC subscription. This is called when a extension has been successfully removed from tap-fx.
     * @param data 
     */
    private _onRemoveExtension(data: any): void {
        console.log('[SHELL] Received removeExtension message: ', data);
        let extensionId = data.extensionId;
        let extension = this._findExtension(extensionId);
        let defer = this._extensionCommandQueue.current.defer;
        if (extension) {
            // remove the extension (blades are taken care of by tap-fx and the remove blade RPC subscription)
            this._performRemoveExtension(extension);

            console.log('[SHELL] Finish unloading extension: ' + extension.name);
            if (defer) defer.resolve({ successful: true, message: 'extension unloaded'});
        } else {
            if (defer) defer.resolve({ successful: false, message: 'extension unload failed: extension not found'});
        }
    }

    /**
     * Function called from the remove extension failed RPC subscription. This is called when a extension failed to be removed from tap-fx.
     * @param data 
     */
    private _onRemoveExtensionFailed(data: any): void {
        console.log('[SHELL] Received removeExtensionFailed message: ', data);
        let extensionId = data.extensionId;
        let extension = this._findExtension(extensionId);
        let defer = this._extensionCommandQueue.current.defer;
        if (extension) {
            // TODO: this needs to redirect to the previous URL since the extension didn't unload (so the URL needs to reflect the correct location)
            //let urlFragment = '/';
            this._extensionCommandQueue.clear();
            //this._eventAggregator.publish('shell.router.reroute', { urlFragment: urlFragment });

            console.log('[SHELL] Failed unloading extension: ' + extension.name);
            if (defer) defer.resolve({ successful: false, message: 'extension unload failed'});
        } else {
            if (defer) defer.resolve({ successful: false, message: 'extension unload failed: extension not found'});
        }
    }

    /**
     * Removes an extension's blade from the shell.
     * @param data 
     */
    private _onRemoveBlade(data: any): void {
        console.log('[SHELL] Received removeBlade message: ', data);
        let extensionId = data.extensionId;
        let extension = this._findExtension(extensionId);
        if (extension) {
            // remove the blade
            extension.removeBlade(data.bladeId);

            console.log('[SHELL] Finish removing blade for extension: ' + extension.name);
            // if there are no more blades, remove the extension
            if (data.manualRemoval && extension.blades.length === 0) {
                console.log('[SHELL] No more blades left - unloading extension: ' + extension.name);
                // remove the extension
                this._performRemoveExtension(extension);

                this._extensionCommandQueue.clear();
                this._eventAggregator.publish('shell.router.reroute', { urlFragment: '/' });
            }
        } else {
            // 
        }
    }

    /**
     * Performs the remove extension logic for the extension manager. Calls the extension loader engine to unload the extension, removes the extension from the list of extensions, and removes the mapping of the name to the id.
     * @param extension 
     */
    private _performRemoveExtension(extension: Extension) {
        // unload the extension
        this._extensionLoaderEngine.unloadExtension(extension.id);

        // remove the extension and delete it's id from our map
        this.extensions.splice(this._findExtensionIndex(extension.id));
        this._extensionIdMap.delete(extension.name);
    }

    /**
     * Load an extension with the passed params.
     * @param extensionName 
     * @param params 
     * @param queryParams 
     */
    loadExtension(extensionName: string, params: any[], queryParams: Object): void {
        // get a new extension id
        let extensionId = window.TapFx.Utilities.newGuid();
        this._extensionIdMap.set(extensionName, extensionId);

        // queue the load command
        this._extensionCommandQueue.queueCommand(extensionId, () => {
            this._extensionLoaderEngine.loadExtension(extensionId, extensionName).then((result) => {
                this.extensions.push(this._extensionFactory(extensionId, extensionName));
            });
        });

        // if we have params or query params, queue an event following the load command which will update those params
        if (params.length > 0 || Object.keys(queryParams).length > 0)
            this._queueUpdateExtensionParams(extensionId, params, queryParams);
    }

    /**
     * Update an extension with the passed params.
     * @param extensionName 
     * @param params 
     * @param queryParams 
     */
    updateExtensionParams(extensionName: string, params: any[], queryParams: Object): void {
        let extensionId = this._extensionIdMap.get(extensionName);
        if (extensionId) {
            this._queueUpdateExtensionParams(extensionId, params, queryParams);
        } else {
            // TODO: display an error page
        }
    }

    /**
     * Queues an update extension params command.
     * @param extensionId 
     * @param params 
     * @param queryParams 
     */
    private _queueUpdateExtensionParams(extensionId: string, params: any[], queryParams: Object): void {
        this._extensionCommandQueue.queueCommand(extensionId, () => {
            // update params for that extension
            window.TapFx.Rpc.publish('tapfx.updateExtensionParams', extensionId, { params: params, queryParams: queryParams });

            // for now, automatically resolve (otherwise the queue will get stuck / timeout)
            // note: in the future, should probably subscribe to a 'shell.updateExtensionParams' from the extension to detect when the update params completed and then resolve. similar to what loadExtension and unloadExtension do
            let defer = this._extensionCommandQueue.current.defer;
            if (defer) defer.resolve({ successful: true, message: 'extension params updated'});
        });
    }

    /**
     * Unload an extension.
     * @param extensionName 
     */
    unloadExtension(extensionName: string): void {
        let extensionId = this._extensionIdMap.get(extensionName);
        if (extensionId) {
            this._extensionCommandQueue.queueCommand(extensionId, () => {
                window.TapFx.Rpc.publish('tapfx.removeExtension', extensionId);
            });
        } else {
            // TODO: display an error page
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
     * @returns The extension or undefined if no extension was found.
     */
    private _findExtension(extensionId: string): Extension | undefined {
        return this.extensions.find((ext) => {
            return ext.id === extensionId;
        });
    }
}

export default ExtensionManager;
import { inject } from 'aurelia-framework';

import { ITapFx } from '../../fx/core/bootstrap';
import { ExtensionManager } from './../extensionManagement/extensionManager';
import { Command } from './command';

@inject(ExtensionManager, 'TapFx')
export class CommandManager {
    constructor(
        private _extensionManager: ExtensionManager,
        private _tapFx: ITapFx,
    ) { }

    /**
     * Handle a route change from one route URL fragment to another.
     * NOTE: We may not need to pass the "from" every time, might be better to just store it.
     * @param from The URL fragment being navigated from.
     * @param to The URL fragment being navigated to.
     */
    public handleRouteChange(from: string, to: string): void {
        console.log('[SHELL] Handle route change from "' + from + '" to "' + to + '".');

        // resolve the URL fragments into usable commands.
        const fromCommand = this.resolveUrlToCommand(from);
        const toCommand = this.resolveUrlToCommand(to);

        // if both extensions are blank '' it means we don't need to load any extension since this is the portal home
        if (fromCommand.extensionName === toCommand.extensionName && toCommand.extensionName === '') {
            return;
        }
        
        // if the extension is the same, we'll send a command to update extension params
        if (fromCommand.extensionName === toCommand.extensionName) {
            // NOTE: should we check if the params were updated?
            this._updateExtensionParams(toCommand);
        } else {
            // if the previous extension is not empty (meaning it is loaded), unload it
            if (fromCommand.extensionName !== '') {
                this._unloadExtension(fromCommand);
            }
            // if the to extension is set, load it
            if (toCommand.extensionName !== '') {
                this._loadExtension(toCommand);
            }
        }
    }

    /**
     * Resolve a URL fragment to a command. If split, this would be part of the Extension Resolver Engine.
     * @param url 
     */
    public resolveUrlToCommand(url: string): Command {
        // URL fragment parsing (may change this to use a regex in the future)
        let fragment: string = url;
        let queryString: string = '';
        const queryIndex = fragment.indexOf('?');
        if (queryIndex !== -1) {
            fragment = url.substr(0, queryIndex);
            queryString = url.substr(queryIndex + 1);
        }
        const fragmentArr = fragment.slice(1).split('/');
        
        // form the command
        const command = new Command();
        command.extensionName = fragmentArr[0];
        command.params = (fragmentArr.length > 1 ? fragmentArr.slice(1) : []);
        command.queryParams = (queryString.length > 0 ? this._tapFx.Utilities.convertQueryStringToObject(queryString) : {});

        return command;
    }

    /**
     * Call the extension manager to load an extension using the passed command.
     * @param command 
     */
    private _loadExtension(command: Command): void {
        console.log('[SHELL] Start loading extension: ' + command.extensionName + ' with extension params: ', command.params);
        this._extensionManager.loadExtension(command.extensionName, command.params, command.queryParams);
    }

    /**
     * Call the extension manager to update an extension's parameters using the passed command.
     * @param command 
     */
    private _updateExtensionParams(command: Command): void {
        console.log('[SHELL] Start updating extension: ' + command.extensionName + ' with extension params: ', command.params);
        this._extensionManager.updateExtensionParams(command.extensionName, command.params, command.queryParams);
    }

    /**
     * Call the extension manager to unload an extension using the passed command.
     * @param command 
     */
    private _unloadExtension(command: Command): void {
        console.log('[SHELL] Start unloading extension: ' + command.extensionName);
        this._extensionManager.unloadExtension(command.extensionName);
    }
}

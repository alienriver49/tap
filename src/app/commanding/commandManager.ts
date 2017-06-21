import { inject } from 'aurelia-framework'
import ExtensionManager from './../extensionManager'
import Command from './command'

@inject(ExtensionManager)
class CommandManager {
    constructor(
        private _extensionManager: ExtensionManager
    ) { }

    /**
     * Handle a route change from one route URL fragment to another.
     * NOTE: We may not need to pass the "from" every time, might be better to just store it.
     * @param from The URL fragment being navigated from.
     * @param to The URL fragment being navigated to.
     */
    handleRouteChange(from: string, to: string): void {
        console.log('[SHELL] Handle route change from "' + from + '" to "' + to + '".');

        // resolve the URL fragments into usable commands.
        let fromCommand = this.resolveUrlToCommand(from);
        let toCommand = this.resolveUrlToCommand(to);

        // if both extensions are blank '' it means we don't need to load any extension since this is the portal home
        if (fromCommand.extensionName === toCommand.extensionName && toCommand.extensionName === '') {
            return;
        }

        let promiseArray: Promise<any>[] = [];
        // if the extension is the same, we'll send a command to update extension params
        if (fromCommand.extensionName === toCommand.extensionName) {
            // NOTE: should we check if the params were updated?
            promiseArray.push(this.updateExtensionParams(toCommand));
        } else {
            // if the previous extension is not empty (meaning it is loaded), unload it
            if (fromCommand.extensionName !== '') {
                promiseArray.push(this.unloadExtension(fromCommand));
            }
            // if the to extension is set, load it
            if (toCommand.extensionName !== '') {
                
                promiseArray.push(this.loadExtension(toCommand));
            }
        }

        // TODO: need to make sure that the next promise in sequence doesn't execute until the previous finishes; at least initially
        Promise.all(promiseArray).then(values => { 
            
        });
    }

    /**
     * Resolve a URL fragment to a command. This can be considered part of the Extension Resolver Engine.
     * @param url 
     */
    resolveUrlToCommand(url: string): Command {
        // URL fragment parsing (may change this to use a regex in the future)
        let fragment: string = url;
        let queryString: string = '';
        let queryIndex = fragment.indexOf('?');
        if (queryIndex !== -1) {
            fragment = url.substr(0, queryIndex);
            queryString = url.substr(queryIndex + 1);
        }
        let fragmentArr = fragment.slice(1).split('/');
        
        // form the command
        let command = new Command();
        command.extensionName = fragmentArr[0];
        command.params = (fragmentArr.length > 1 ? fragmentArr.slice(1) : []);
        command.queryParams = (fragmentArr.length > 2 ? window.TapFx.Utilities.convertQueryStringToObject(fragmentArr[2]) : {});

        return command;
    }

    /**
     * Returns a promise which will load an extension using the passed command.
     * @param command 
     */
    loadExtension(command: Command): Promise<string> {
        console.log('[SHELL] Start loading extension: ' + command.extensionName + ' with extension params: ', command.params);
        return this._extensionManager.loadExtension(command.extensionName, command.params, command.queryParams);
    }

    /**
     * Returns a promise which will update an extension's parameters using the passed command.
     * @param command 
     */
    updateExtensionParams(command: Command): Promise<string> {
        console.log('[SHELL] Start updating extension: ' + command.extensionName + ' with extension params: ', command.params);
        return this._extensionManager.updateExtensionParams(command.extensionName, command.params, command.queryParams);
    }

    /**
     * Returns a promise which will unload an extension using the passed command.
     * @param command 
     */
    unloadExtension(command: Command): Promise<string> {
        console.log('[SHELL] Start unloading extension: ' + command.extensionName);
        return this._extensionManager.unloadExtension(command.extensionName);
    }
}

export default CommandManager;
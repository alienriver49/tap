import { inject } from 'aurelia-framework'
import ExtensionManager from './extensionManager'
import Command from './command' // type only

@inject(ExtensionManager)
class CommandManager {
    constructor(public extensionManager: ExtensionManager) { }

    handleRouteChange(from: string, to: string): void {
        console.log('[SHELL] Handle route change from "' + from + '" to "' + to + '".');

        let fromCommand = this.resolveUrlToCommand(from);
        let toCommand = this.resolveUrlToCommand(to);

        // Not sure we want the command manager to manage this case
        /*if (from === to) {
            return;
        }*/
        
        if (fromCommand.extensionName === toCommand.extensionName) {
            this.updateExtensionParams(toCommand.extensionName, toCommand.params);
        } else if(toCommand.extensionName === "") {
            this.unloadExtension(toCommand.extensionName);
        } else {
            this.loadExtension(toCommand.extensionName, toCommand.params);
        }
    }

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
        // TODO: Determine handling of query params
        //command.queryParams = (arr.length > 2 ? utilities.convertQueryStringToObject(arr[2]) : {});

        return command;
    }

    loadExtension(extensionName: string, ...params: any[]): void {
        console.log('[SHELL] Start loading extension: ' + extensionName + ' with extension params: ', ...params);
        this.extensionManager.loadExtension(extensionName, ...params).then((extensionID) => {
            console.log('[SHELL] Finish loading extension: ' + extensionName + ' with (ID): ', extensionID);
            console.log('');
        });
    }

    updateExtensionParams(extensionName: string, ...params: any[]): void {
        console.log('[SHELL] Start updating extension: ' + extensionName + ' with extension params: ', ...params);
        this.extensionManager.updateExtensionParams(extensionName, ...params).then((response) => {
            console.log('[SHELL] Finish updating extension: ' + extensionName + ' with response: ', response);
            console.log('');
        });
    }

    unloadExtension(extensionName: string): void {
        console.log('[SHELL] Start unloading extension: ' + extensionName);
        this.extensionManager.unloadExtension(extensionName).then((response) => {
            console.log('[SHELL] Finish unloading extension: ' + extensionName + ' with response: ', response);
            console.log('');
        });
    }
}

export default CommandManager;
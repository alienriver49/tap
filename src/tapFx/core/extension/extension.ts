import { inject } from 'aurelia-dependency-injection'
import Utilities from './../../utilities/utilities'
import { RpcClient, RpcClientSubscription } from './../../rpc/client'
import BindingEngine from './../../binding/bindingEngine'
import {formParser} from './../../ux/form/formParser'
import Blade from './../../ux/viewModels/viewModels.blade' // type only

/**
 * Interface defining a function. Includes the name and the property descriptor.
 */
interface IFunction {
    funcName: string;
    funcDesc: PropertyDescriptor;
}

@inject(Utilities, RpcClient, BindingEngine)
class Extension {
    constructor(
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _bindingEngine: BindingEngine
    ) {
        let subscription = this._rpc.subscribe('tapfx.removeExtension', this._onRemoveExtension.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = this._rpc.subscribe('tapfx.updateExtensionParams', this._onUpdateExtensionParams.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    private _rpcSubscriptions: RpcClientSubscription[] = [];
    private _bladeSubscriptions: Map<string, RpcClientSubscription[]> = new Map();
    /**
     * Same thing as the _contextIDMap in the bindingEngine.
     */
    private _bladeIdMap: Map<Blade, string> = new Map();
    private _className: string = (this as Object).constructor.name;

    /**
     * To be implemented by the extension developer.
     */
    public updateParams?(params: any[], queryParams: Object): void;

    // TODO: perform deactivation checks for each blade of the extension
    private _onRemoveExtension(data: any): void {
        console.log('[TAP-FX] Removing extension with id of: ' + this._rpc.InstanceId);
        // unobserve all and clear out the binding engine
        this._bindingEngine.unobserveAll();

        // unsubscribe any events
        this._rpcSubscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });

        // unsubscribe from an blade subscriptions
        this._bladeSubscriptions.forEach((subscriptions) => {
            subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
        });

        // publish to the shell that this extension is ready to be removed
        let returnData: Object = {
            extensionId: this._rpc.InstanceId
        };
        this._rpc.publish('shell.removeExtension', '', returnData);
    }

    private _onUpdateExtensionParams(data: any): void {
        if (this.updateParams) this.updateParams(data.params, data.queryParams);
    }

    /**
     * Attempts to add a blade to an extension. This will check the canActivate function and call activate. If canActivate fails, the shell will be notified.
     * @param blade 
     * @param viewName 
     */
    addBlade(blade: Blade, viewName: string): void {
        let activateChain = Promise.resolve<boolean>(true);
        // if there is no canActivate method we return true, otherwise we will return the result of blade.canActivate()
        let canActivate = (!blade.canActivate) || (blade.canActivate && blade.canActivate());
        // if it's true or a promise
        if (canActivate) {
            // let's chain our results together
            activateChain = activateChain.then((result) => {
                console.log('[TAP-FX] addBlade activateChain 1 result: ' + result);
                // whether it's true or a promise we will return it
                return canActivate;
            });
            activateChain = activateChain.then((result) => {
                console.log('[TAP-FX] addBlade activateChain 2 result: ' + result);
                // result is the value from canActivate or the return value from the canActivate() promise
                let ret: boolean | Promise<boolean> = result;
                if (result) {
                    // if we canActivate, call the activate function if it exists and have it return our result
                    let activate = blade.activate ? blade.activate() : undefined;
                    if (activate) ret = activate.then(() => { return result; });
                }
                
                return ret;
            });
            activateChain = activateChain.then((result) => {
                console.log('[TAP-FX] addBlade activateChain 3 result: ' + result);
                // if we canActivate and the activate method has been called, add the blade
                if (result) {
                    this._performAddBlade(blade, viewName);
                } else {
                    // otherwise, notify the shell that we failed
                    this._addBladeFailed();
                }
                return result;
            });
        } else {
            this._addBladeFailed();
        }
    }

    private _performAddBlade(blade: Blade, viewName: string): void {
        let bladeInfo = this._registerBladeBindings(blade);
        // Get the extension Id from RPC and pass it to the shell
        bladeInfo.extensionId = this._rpc.InstanceId;
        bladeInfo.viewName = viewName;
        bladeInfo.functions = this._registerBladeFunctions(blade, bladeInfo.bladeId);
        bladeInfo.view = this._parseBladeForm(blade);
        
        this._bladeIdMap.set(blade, bladeInfo.bladeId);
        this._rpc.publish('shell.addBlade', "", bladeInfo);
    }

    private _parseBladeForm(blade: Blade): string {
        if (!blade.form)
            return '';
        let viewHTML = formParser.parseFormToHTML(blade.form);
        return viewHTML;
    }

    private _addBladeFailed(message?: string): void {
        let returnData: Object = {
            extensionId: this._rpc.InstanceId
        };
        if (message)
            console.log(`[addBladeFailed]: message`)
        this._rpc.publish('shell.addBladeFailed', '', returnData);
    }

    /**
     * Remove a blade 
     * @param blade
     */
    removeBlade(blade: Blade): void {
        let bladeId = this._bladeIdMap.get(blade);
        let deactivateChain = Promise.resolve<boolean>(true);
        // if there is no canDeactivate method we return true, otherwise we will return the result of blade.canDeactivate()
        let canDeactivate = (!blade.canDeactivate) || (blade.canDeactivate && blade.canDeactivate());
        // if it's true or a promise
        if (bladeId && canDeactivate) {
            // let's chain our results together
            deactivateChain = deactivateChain.then((result) => {
                console.log('[TAP-FX] removeBlade deactivateChain 1 result: ' + result);
                // whether it's true or a promise we will return it
                return canDeactivate;
            });
            deactivateChain = deactivateChain.then((result) => {
                console.log('[TAP-FX] removeBlade deactivateChain 2 result: ' + result);
                // result is the value from canDeactivate or the return value from the canDeactivate() promise
                let ret: boolean | Promise<boolean> = result;
                if (result) {
                    // if we canDeactivate, call the deactivate function if it exists and have it return our result
                    let deactivate = blade.deactivate ? blade.deactivate() : undefined;
                    if (deactivate) ret = deactivate.then(() => { return result; });
                }
                
                return ret;
            });
            deactivateChain = deactivateChain.then((result) => {
                console.log('[TAP-FX] removeBlade deactivateChain 3 result: ' + result);
                // if we canDeactivate and the deactivate method has been called, remove the blade
                if (result) {
                    if (bladeId) this._performRemoveBlade(blade, bladeId);
                } else {
                    // otherwise, notify the shell that we failed
                    this._removeBladeFailed();
                }
                return result;
            });
        } else {
            this._removeBladeFailed();
        }
    }

    private _performRemoveBlade(blade: Blade, bladeId: string) {
        // unobserve this blade
        this._bindingEngine.unobserve(blade);

        // unsubscribe from any blade events
        (this._bladeSubscriptions.get(bladeId) || []).forEach((subscription) => {
            subscription.unsubscribe();
        });

        this._bladeIdMap.delete(blade);
        this._bladeSubscriptions.delete(bladeId);

        // publish to the shell that this blade is ready to be removed
        let returnData: Object = {
            extensionId: this._rpc.InstanceId,
            bladeId: bladeId
        };
        this._rpc.publish('shell.removeBlade', '', returnData);
    }

    private _removeBladeFailed() {

    }

    private _registerBladeBindings(blade: Blade): any {
        let serializedBlade = {};

        let bladeID = this._utilities.newGuid();
        this._bindingEngine.resolveId(blade, bladeID);

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
                prop !== 'form' &&  // don't observe form
                prop.charAt(0) !== '_' &&
                this._utilities.classOf(blade[prop]) !== '[object Function]'
            ) {
                this._bindingEngine.observe(blade, prop);
                serializedBlade[prop] = blade[prop];
            }
        }

        return {
            bladeId: bladeID,
            serializedBlade: serializedBlade
        }
    }

    /**
     * Register the blade's functions as subscriptions so that they can be called from the shell over the RPC.
     * @param blade 
     * @param bladeId 
     */
    private _registerBladeFunctions(blade: Blade, bladeId: string): string[] {
        let subArray: RpcClientSubscription[] = [];
        let returnFuncs: string[] = [];
        // for now, don't sync the activation lifecycle functions over
        let funcIgnoreArray = ['constructor', 'activate', 'canActivate', 'deactivate', 'canDeactivate'];
        // get the functions from the blade prototype
        let bladeFuncs = this._getBladeFunctions(blade);
        for (let func of bladeFuncs) {
            let funcName = func.funcName;
            let funcDesc = func.funcDesc;
            // ignore private functions beginning with _, similar to property observing
            // for now, we will use a function ignore array to ignore functions we don't want to listen for (like 'constructor')
            // TODO: determine how to attach get and set functions
            if (funcName.charAt(0) !== '_' &&
                funcIgnoreArray.indexOf(funcName) === -1/* &&
                funcDesc.get === undefined*/
            ) {
                // add a subscription which will call the blade's original function with the passed function args
                let subscription = this._rpc.subscribe('tapfx.' + bladeId + '.' + funcName, (data) => {
                    // call the function and get the result
                    console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Received message from function: ` + funcName);
                    let result = blade[funcName](...data.functionArgs);

                    // publish the result back to the shell
                    console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Publishing result from function: ` + funcName);
                    this._rpc.publish('shell.' + bladeId + '.' + funcName, '', result);
                });
                subArray.push(subscription);
                returnFuncs.push(funcName);
            }
        }

        // convention - add a subscription for the onButtonRemoveClick which calls the removeBlade function
        let funcName = 'onButtonRemoveClick'
        let subscription = this._rpc.subscribe('tapfx.' + bladeId + '.' + funcName, (data) => {
            // call the function and get the result
            console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Received message from function: ` + funcName);
            let result = this.removeBlade(blade);

            // publish the result back to the shell
            console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Publishing result from function: ` + funcName);
            this._rpc.publish('shell.' + bladeId + '.' + funcName, '', result);
        });
        subArray.push(subscription);
        returnFuncs.push(funcName);

        // set anny subscriptions to the _bladeSubscriptions map mapped by the blade id
        this._bladeSubscriptions.set(bladeId, subArray);

        return returnFuncs;
    }

    /**
     * Get an array of function information for a blade.
     * @param blade 
     */
    private _getBladeFunctions(blade: Blade): IFunction[] {
        // get the proto of the blade and then the functions from that
        let bladeProto = Object.getPrototypeOf(blade);
        let bladeFuncs = Object.getOwnPropertyNames(bladeProto);

        // now lets map that to an array of function information
        let funcs = bladeFuncs.map((funcName: string): IFunction => {
            return { funcName: funcName, funcDesc: Object.getOwnPropertyDescriptor(bladeProto, funcName) };
        });

        return funcs;
    }
}

export default Extension;
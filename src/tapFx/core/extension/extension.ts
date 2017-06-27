import { inject } from 'aurelia-dependency-injection'
import Utilities from './../../utilities/utilities'
import { RpcClient, RpcClientSubscription } from './../../rpc/client'
import BindingEngine from './../../binding/bindingEngine'
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
    }

    private _rpcSubscriptions: RpcClientSubscription[] = [];
    private _bladeIDs: string[] = [];
    private _className: string = (this as Object).constructor.name;

    private _onRemoveExtension(data: any) {
        console.log('[TAP-FX] Removing extension with id of: ' + this._rpc.InstanceId);
        // unobserve all and clear out the binding engine
        this._bindingEngine.unobserveAll();

        // unsubscribe any events
        this._rpcSubscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });

        // publish to the shell that this extension is ready to be removed
        let returnData: Object = {
            extensionId: this._rpc.InstanceId
        };
        this._rpc.publish('shell.removeExtension', '', returnData);
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
        let bladeInfo = this.registerBladeBindings(blade);
        // Get the extension Id from RPC and pass it to the shell
        bladeInfo.extensionId = this._rpc.InstanceId;
        bladeInfo.viewName = viewName;
        bladeInfo.functions = this.registerBladeFunctions(blade, bladeInfo.bladeId);
        this._rpc.publish('shell.addBlade', "", bladeInfo);
    }

    private _addBladeFailed(): void {
        let returnData: Object = {
            extensionId: this._rpc.InstanceId
        };
        this._rpc.publish('shell.addBladeFailed', '', returnData);
    }

    registerBladeBindings(blade: Blade): any {
        let serializedBlade = {};

        let bladeID = this._utilities.newGuid();
        this._bindingEngine.resolveId(blade, bladeID);

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
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

    registerBladeFunctions(blade: Blade, bladeId: string): string[] {
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
                let subscription = this._rpc.subscribe('tapfx.' + bladeId + '.' + func, (data) => {
                    // call the function and get the result
                    console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Received message from function: ` + func);
                    let result = blade[funcName](...data.functionArgs);

                    // publish the result back to the shell
                    console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Publishing result from function: ` + func);
                    this._rpc.publish('shell.' + bladeId + '.' + func, '', result);
                });
                this._rpcSubscriptions.push(subscription);

                returnFuncs.push(funcName);
            }
        }

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
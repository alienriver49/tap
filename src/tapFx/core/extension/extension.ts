import { inject } from 'aurelia-dependency-injection'
import Utilities from './../../utilities/utilities'
import { RpcClient, RpcClientSubscription } from './../../rpc/client'
import BindingEngine from './../../binding/bindingEngine'
import Blade from './../../ux/viewModels/viewModels.blade' // type only

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

    registerBladeBindings(blade: Object): any {
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

    attachBladeFunctions(blade: Object): string[] {
        let returnFuncs: string[] = [];
        let funcIgnoreArray = ['constructor'];
        let bladeProto = Object.getPrototypeOf(blade);
        let bladeFuncs = Object.getOwnPropertyNames(bladeProto);
        for (let func of bladeFuncs) {
            // TODO: implement conventions
            // ignore private functions beginning with _, similar to property observing
            // for now, we will use a function ignore array to ignore functions we don't want to listen for (like 'constructor')
            if (func.charAt(0) !== '_' &&
                funcIgnoreArray.indexOf(func) === -1
            ) {
                let subscription = this._rpc.subscribe('tapfx.' + func, (data) => {
                    console.log(`[TAP-FX][${this._rpc.InstanceId}] Received message from function: ` + func);
                    blade[func](...data.functionData);
                });
                this._rpcSubscriptions.push(subscription);

                returnFuncs.push(func);
            }
        }

        return returnFuncs;
    }

    addBlade(blade: Blade, viewName: string): void {
        let bladeInfo = this.registerBladeBindings(blade);
        // Get the extension Id from RPC and pass it to the shell
        bladeInfo.extensionId = this._rpc.InstanceId;
        bladeInfo.viewName = viewName;
        bladeInfo.functions = this.attachBladeFunctions(blade);
        this._rpc.publish('tapfx.newBlade', "", bladeInfo);
    }
}

export default Extension;
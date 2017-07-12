import { inject } from 'aurelia-dependency-injection'
import BladeEngine from './bladeEngine'
import DeferredPromise from './../../core/deferredPromise'
import Utilities from './../../utilities/utilities'
import { RpcClient, RpcClientSubscription } from './../../rpc/client'
import {BindingEngine, IChildMetadata, ISerializedObject} from './../../binding/bindingEngine'
import {formParser} from './../../ux/form/formParser'
import BaseBlade from './../../ux/viewModels/viewModels.baseBlade' // type only

/**
 * Interface defining a function. Includes the name and the property descriptor.
 */
interface IFunction {
    funcName: string;
    funcDesc: PropertyDescriptor;
}

interface IBladeInfo {
    bladeId: string;
    bladeSequence: number;
}

@inject(BladeEngine, Utilities, RpcClient, BindingEngine)
class Extension {
    constructor(
        private _bladeEngine: BladeEngine,
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _bindingEngine: BindingEngine
    ) {
        let subscription = this._rpc.subscribe('tapfx.removeExtension', this._onRemoveExtension.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = this._rpc.subscribe('tapfx.updateExtensionParams', this._onUpdateExtensionParams.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    /**
     * Extension subscriptions.
     */
    private _rpcSubscriptions: RpcClientSubscription[] = [];
    /**
     * Subscriptions for the extension's blades (i.e. subscriptions to function calls).
     */
    private _bladeSubscriptions: Map<string, RpcClientSubscription[]> = new Map();
    /**
     * Maps blades to their blade information.
     */
    private _bladeInfoMap: Map<BaseBlade, IBladeInfo> = new Map();
    private _className: string = (this as Object).constructor.name;

    /**
     * To be implemented by the extension developer.
     */
    public updateParams?(params: any[], queryParams: Object): void;

    /**
     * Function called from the remove extension RPC call. Loops through the blades of the extension in descending order to remove them (calling deactivate for each).
     * @param data 
     */
    private _onRemoveExtension(data: any): void {
        console.log('[TAP-FX] Removing extension with id of: ' + this._rpc.InstanceId);

        // the removal chain keeps track of the removal of blades in sequential order
        let removalChain = Promise.resolve<boolean>(true);
        // loop through the blade mappings in order of the blade sequence
        let bladeMappings = [...this._bladeInfoMap.entries()].sort((a, b) => { return b[1].bladeSequence - a[1].bladeSequence; });
        bladeMappings.forEach((bladeMapping) => {
            console.log(bladeMapping[1]);
            removalChain = removalChain.then((result) => {
                // if the result was true, means the last blade was removed
                if (result)
                    return this._removeBlade(bladeMapping[0]);
                else
                    return result;
            });
        });

        // after the final blade
        removalChain = removalChain.then((result) => {
            // if all blades were removed we will unsubscribe from 
            if (result) {
                this._rpcSubscriptions.forEach((subscription) => {
                    subscription.unsubscribe();
                });

                // publish to the shell that this extension is ready to be removed.
                let returnData: Object = {
                    extensionId: this._rpc.InstanceId
                };
                this._rpc.publish('shell.removeExtension', '', returnData);
            } else
                this._removeExtensionFailed();
            
            return result;
        });
    }

    /**
     * Publish to the shell that the removing of the extension failed.
     */
    private _removeExtensionFailed() {
        let returnData: Object = {
            extensionId: this._rpc.InstanceId
        };
        this._rpc.publish('shell.removeExtensionFailed', '', returnData);
    }

    /**
     * Function called from the update extension params RPC call. Will call the extensions updateParams if the developer has defined it.
     * @param data 
     */
    private _onUpdateExtensionParams(data: any): void {
        if (this.updateParams) this.updateParams(data.params, data.queryParams);
    }

    /**
     * Attempts to add a blade to an extension. Calls activation lifecycle hooks.
     * @param blade 
     * @param viewName 
     */
    addBlade(blade: BaseBlade, viewName: string): void {
        let canActivate = this._bladeEngine.canActivate(blade);
        canActivate.then((result) => {
            if (result) {
                this._performAddBlade(blade, viewName);
            } else {
                this._addBladeFailed();
            }
        });
    }

    /**
     * Function which performs the adding of a blade (since activation was successful). Publishes back to the shell that the blade was added.
     * @param blade 
     * @param viewName 
     */
    private _performAddBlade(blade: BaseBlade, viewName: string): void {
        let bladeInfo = this._registerBladeBindings(blade);
        // Get the extension Id from RPC and pass it to the shell
        bladeInfo.extensionId = this._rpc.InstanceId;
        bladeInfo.viewName = viewName;
        bladeInfo.functions = this._registerBladeFunctions(blade, bladeInfo.bladeId);
        bladeInfo.view = this._parseBladeForm(blade);
        
        this._bladeInfoMap.set(blade, { bladeId: bladeInfo.bladeId, bladeSequence: this._getNextBladeSequence() } );
        this._rpc.publish('shell.addBlade', "", bladeInfo);
    }

    private _parseBladeForm(blade: BaseBlade): string {
        if (!blade.form)
            return '';
        let viewHTML = formParser.parseFormToHTML(blade.form);
        return viewHTML;
    }

    /**
     * Function which handles when an add blade event has failed. Publishes back to the shell that the add of a blade failed.
     */
    private _addBladeFailed(): void {
        let returnData: Object = {
            extensionId: this._rpc.InstanceId
        };
        this._rpc.publish('shell.addBladeFailed', '', returnData);
    }

    /**
     * Attempts to remove a blade from an extension. Calls deactivation lifecycle hooks.
     * @param blade
     */
    removeBlade(blade: BaseBlade): void {
        this._removeBlade(blade); 
    }

    /**
     * Attempts to remove a blade from an extension. Wrapped by removeBlade as to not expose too much functionality to the extension developer.
     * @param blade
     * @param manualRemoval Whether the blade is being removed manually (by user interaction).
     */
    private _removeBlade(blade: BaseBlade, manualRemoval: boolean = false): Promise<boolean> {
        let defer = new DeferredPromise<boolean>();

        let bladeInfo = this._bladeInfoMap.get(blade);
        if (!bladeInfo)
            throw Error("Couldn't find blade id associated with passed blade.");

        let bladeId = bladeInfo.bladeId;
        let canDeactivate = this._bladeEngine.canDeactivate(blade);
        canDeactivate.then((result) => {
            if (result) {
                this._performRemoveBlade(blade, bladeId, manualRemoval);
            } else {
                this._removeBladeFailed();
            }
            defer.resolve(result);
        });

        return defer.promise;
    }

    /**
     * Function which performs the removal of a blade (since deactivation was successful). Publishes back to the shell that the blade was removed.
     * @param blade 
     * @param bladeId 
     * @param manualRemoval 
     */
    private _performRemoveBlade(blade: BaseBlade, bladeId: string, manualRemoval: boolean) {
        // unobserve this blade
        this._bindingEngine.unobserve(blade);

        // unsubscribe from any blade events
        (this._bladeSubscriptions.get(bladeId) || []).forEach((subscription) => {
            subscription.unsubscribe();
        });

        this._bladeInfoMap.delete(blade);
        this._bladeSubscriptions.delete(bladeId);

        // publish to the shell that this blade is ready to be removed
        let returnData: Object = {
            extensionId: this._rpc.InstanceId,
            bladeId: bladeId,
            manualRemoval: manualRemoval
        };
        this._rpc.publish('shell.removeBlade', '', returnData);
    }

    // TODO: determine what we need to implement for this and implement it.
    //       common scenerio which might be the cause of this would be because the user was prompted
    //       about unsaved changes and didn't want to leave, so the blade wouldn't be removed (canDeactivate would fail)
    private _removeBladeFailed() {
    }

    private _registerBladeBindings(blade: BaseBlade): any {

        let bladeID = this._utilities.newGuid();
        this._bindingEngine.resolveId(blade, bladeID);

        let serializedBlade: ISerializedObject = {_childMetadata: [], _syncObjectContextId: ''};

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
                prop !== 'form' &&  // don't observe form
                prop.charAt(0) !== '_' &&
                this._utilities.classOf(blade[prop]) !== '[object Function]'
            ) {
                let childMetadata = this._bindingEngine.observe(blade, prop);

                // If the property is an object, we should be back metadata
                // and the property will be reinstantiated using the metadata 
                // on the other side
                if (childMetadata)
                    serializedBlade._childMetadata.push(childMetadata);
                else
                    // otherwise we copy of property as is
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
    private _registerBladeFunctions(blade: BaseBlade, bladeId: string): string[] {
        let subscriptionArray: RpcClientSubscription[] = [];
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
                subscriptionArray.push(subscription);
                returnFuncs.push(funcName);
            }
        }

        // convention - add a subscription for the onButtonRemoveClick which calls the removeBlade function
        let funcName = 'onButtonRemoveClick'
        let subscription = this._rpc.subscribe('tapfx.' + bladeId + '.' + funcName, (data) => {
            // call the _removeBlade function as a manual removal
            console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Received message from function: ` + funcName);
            this._removeBlade(blade, true);

            // publish a void result back to the shell so it doesn't keep listening
            let result = undefined;
            console.log(`[TAP-FX][${this._className}][${this._rpc.InstanceId}] Publishing result from function: ` + funcName);
            this._rpc.publish('shell.' + bladeId + '.' + funcName, '', result);
        });
        subscriptionArray.push(subscription);
        returnFuncs.push(funcName);

        // set any subscriptions to the _bladeSubscriptions map mapped by the blade id
        this._bladeSubscriptions.set(bladeId, subscriptionArray);

        return returnFuncs;
    }

    /**
     * Get an array of function information for a blade.
     * @param blade 
     */
    private _getBladeFunctions(blade: BaseBlade): IFunction[] {
        // get the proto of the blade and then the functions from that
        let bladeProto = Object.getPrototypeOf(blade);
        let bladeFuncs = Object.getOwnPropertyNames(bladeProto);

        // now lets map that to an array of function information
        let funcs = bladeFuncs.map((funcName: string): IFunction => {
            return { funcName: funcName, funcDesc: Object.getOwnPropertyDescriptor(bladeProto, funcName) };
        });

        return funcs;
    }

    /**
     * Get the next sequence for blade ordering.
     */
    private _getNextBladeSequence(): number {
        let bladeMappings = [...this._bladeInfoMap.values()];
        return bladeMappings.length > 0 ? (Math.max.apply(null, bladeMappings.map((bi) => { return bi.bladeSequence })) + 1) : 1;
    }
}

export default Extension;
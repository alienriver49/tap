import { inject } from 'aurelia-dependency-injection'
import BladeEngine from './bladeEngine'
import Utilities from './../../utilities/utilities'
import { RpcClient, RpcClientSubscription } from './../../rpc/client'
import {BindingEngine, ISerializedObject} from './../../binding/bindingEngine'
import DeferredPromise from './../../core/deferredPromise'
import {BladeParser} from './../../ux/bladeParser'
import BaseExtension from './baseExtension'; // type only
import BaseBlade from './../../ux/viewModels/viewModels.baseBlade'; // type only
import * as tapm from './../../metadata/metadata'

/**
 * Interface defining a function. Includes the name and the property descriptor.
 */
interface IFunction {
    funcName: string;
    funcDesc: PropertyDescriptor;
}

/**
 * Interface for storing blade info.
 */
interface IBladeInfo {
    bladeId: string;
}

@inject(BladeEngine, Utilities, RpcClient, BindingEngine, BladeParser)
export class Extension extends BaseExtension {
    constructor(
        private _bladeEngine: BladeEngine,
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _bindingEngine: BindingEngine,
        private _bladeParser: BladeParser
    ) {
        super();
        let subscription = this._rpc.subscribe('tapfx.removeExtension', this._onRemoveExtension.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = this._rpc.subscribe('tapfx.updateExtensionParams', this._onUpdateExtensionParams.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    private _className: string = (this as Object).constructor.name;
    /**
     * Extension subscriptions.
     */
    private _rpcSubscriptions: RpcClientSubscription[] = [];
    /**
     * Subscriptions for the extension's blades (i.e. subscriptions to function calls).
     */
    private _bladeSubscriptions: Map<string, RpcClientSubscription[]> = new Map();
    /**
     * Maps blades to their blade information. This information is stored in order of insertion.
     */
    private _bladeInfoMap: Map<BaseBlade, IBladeInfo> = new Map();

    /**
     * Function called from the remove extension RPC call. Removes all the blades of an extension.
     * @param data 
     */
    private _onRemoveExtension(data: any): void {
        console.log('[TAP-FX] Removing extension with id of: ' + this._rpc.InstanceId);

        // remove all the blades from the extension
        let blades = Array.from(this._bladeInfoMap.keys());
        if (blades.length > 0) {
            this._removeBladeRange(blades[0]).then((result) => {
                // if all blades were removed we will unsubscribe from all rpc subscriptions for the extension
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
        this._bladeEngine.performActivation(blade).then((canActivate) => {
            if (canActivate) {
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
        bladeInfo.view = this._parseBladeForm(blade, bladeInfo.functions);
        
        this._bladeInfoMap.set(blade, { bladeId: bladeInfo.bladeId } );
        this._rpc.publish('shell.addBlade', "", bladeInfo);
    }

    private _parseBladeForm(blade: BaseBlade, bladeFunctions: string[]): string {
        if (!blade.content || blade.content.length === 0)
            return '';
        let viewHTML = this._bladeParser.parseBladeToHTML(blade, bladeFunctions);
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
     * Attempts to remove the passed blades from an extension.
     * @param blades
     */
    removeBlades(...blades: BaseBlade[]): void {
        // find the earliest blade from the passed set and remove the range of blades starting with that blade
        let earliestBlade = this._findEarliestBlade(blades);
        if (earliestBlade) this._removeBladeRange(earliestBlade);
    }

    /**
     * Attempts to remove a range of blades based on the passed starting blade. Currently the ending blade of the range is always the latest blade. This removes the range of blades in descending order beginning with the ending blade of the range.
     * @param startingBlade
     * @param manualRemoval Whether the blade is being removed manually (by user interaction).
     * @return A promise which returns a whether the blades were removed.
     */
    private _removeBladeRange(startingBlade: BaseBlade, manualRemoval: boolean = false): Promise<boolean> {
        // find the id of the earliest blade which exists in the set of blades passed
        let startingBladeInfo = this._bladeInfoMap.get(startingBlade);
        if (!startingBladeInfo)
            throw Error("Couldn't find starting blade for removal of blade range.");

        let startingBladeId = startingBladeInfo.bladeId;
        let bladeMappings = this._getBladeMappings();
        // get the index of the starting blade id
        let sliceIndex = bladeMappings.findIndex((b) => {
            return b.bladeInfo.bladeId === startingBladeId;
        });
        // slice all blades after the earliest blade
        let removeMappings = bladeMappings.slice(sliceIndex);

        // start a removal chain
        let removalChain = Promise.resolve<boolean>(true);
        // keep track if this is the latest blade (max sequence)
        let isLatestBlade = true;
        removeMappings.reverse().forEach((bladeMapping) => {
            let blade = bladeMapping.blade;
            let bladeId = bladeMapping.bladeInfo.bladeId;
            removalChain = removalChain.then((result) => {
                let returnResult: boolean | Promise<boolean> = result;
                // the result is the result of canDeactivate (or true if not the latest blade)
                if (result) {
                    // after the latest blade, we won't check canDeactivate because we will make the assumption that all previous blades finished their tasks
                    returnResult = this._bladeEngine.performDeactivation(blade, isLatestBlade).then((canDeactivate) => {
                        if (canDeactivate) {
                            this._performRemoveBlade(blade, bladeId, manualRemoval);
                        } else {
                            this._removeBladeFailed();
                        }
                        return canDeactivate;
                    });
                    
                    isLatestBlade = false;
                }

                return returnResult;
            });
        });

        return removalChain;
    }

    /**
     * Function which performs the removal of a blade (since deactivation was successful). Publishes back to the shell that the blade was removed.
     * @param blade 
     * @param bladeId 
     * @param manualRemoval 
     */
    private _performRemoveBlade(blade: BaseBlade, bladeId: string, manualRemoval: boolean) {
        // unobserve this blade
        this._bindingEngine.unobserveBlade(blade);

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

        //let bladeId = this._bindingEngine.resolveId(blade);

        //let serializedBlade: ISerializedObject = {_childMetadata: [], _syncObjectContextId: ''};
        let refIds: Set<string> = new Set<string>(); 
        let metadata: ISerializedObject =  {
                property: '',
                contextId: '',
                parentId: '',
                value: null,
                type: '',
                childMetadata: [] 
            };
        let serializedBlade = this._bindingEngine.observeObject(metadata, blade, refIds, this._rpc.InstanceId);

        return {
            bladeId: serializedBlade.contextId,
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
            this._removeBladeRange(blade, true);

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
     * Gets the entries of the blade info map and maps them to an array of objects containing the mapping info.
     */
    private _getBladeMappings(): {blade: BaseBlade, bladeInfo: IBladeInfo}[] {
        return Array.from(this._bladeInfoMap.entries()).map((ba) => { return { blade: ba[0], bladeInfo: ba[1] } });
    }

    /**
     * Based on an array of blades, find the earliest blade (earliest insertion) in that array which is mapped to this extension.
     * @param searchBlades 
     */
    private _findEarliestBlade(searchBlades: BaseBlade[]): BaseBlade | undefined {
        let earliestBlade: BaseBlade | undefined;
        // grab entries from the map (Map orders by insertion so they are in ascending order already), map this to a useful object
        let bladeMappings = this._getBladeMappings();
        // intercept the two arrays finding values which exist in both
        let interceptedBlades = bladeMappings.filter((bladeMapping) => { return searchBlades.indexOf(bladeMapping.blade) !== -1; });
        // the earliest blade will be the first entry in this interception
        if (interceptedBlades.length > 0) {
            earliestBlade = interceptedBlades[0].blade;
        }

        return earliestBlade;
    }
}

export default Extension;
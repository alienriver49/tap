import { inject } from 'aurelia-dependency-injection';

import { BladeEngine } from './bladeEngine';
import { BaseExtension } from './baseExtension'; // type only

import { Utilities } from '../../utilities/utilities';
import { RpcClient, IRpcClientSubscription } from '../../rpc/client';
import { BindingEngine } from '../../binding/bindingEngine';
import { SerializedObject } from '../../binding/serializedObject';
import { SerializedView } from '../../binding/serializedView';
import { DeferredPromise } from '../../core/deferredPromise';
import { ViewParser } from '../../ux/viewParser';
import { BaseBlade } from '../../ux/viewModels/viewModels.baseBlade'; // type only

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

/**
 * The object that is sent to the shell when adding a blade
 */
export interface IAddBladeMessage {
    extensionId: string;
    bladeId: string;
    viewName: string;
    serializedBlade: SerializedObject;
    serializedViews: SerializedView[];
}

@inject(BladeEngine, Utilities, RpcClient, BindingEngine, ViewParser)
export class Extension extends BaseExtension {
    constructor(
        private _bladeEngine: BladeEngine,
        private _utilities: Utilities,
        private _rpc: RpcClient,
        private _bindingEngine: BindingEngine,
        private _viewParser: ViewParser
    ) {
        super();
        let subscription = this._rpc.subscribe('tapfx.removeExtension', this._onRemoveExtension.bind(this));
        this._rpcSubscriptions.push(subscription);

        subscription = this._rpc.subscribe('tapfx.updateExtensionParams', this._onUpdateExtensionParams.bind(this));
        this._rpcSubscriptions.push(subscription);

    }

    private _className: string = (this as object).constructor.name;
    /**
     * Extension subscriptions.
     */
    private _rpcSubscriptions: IRpcClientSubscription[] = [];
    /**
     * Subscriptions for the extension's blades (i.e. subscriptions to function calls).
     */
    private _bladeSubscriptions: Map<string, IRpcClientSubscription[]> = new Map();
    /**
     * Maps blades to their blade information. This information is stored in order of insertion.
     */
    private _bladeInfoMap: Map<BaseBlade, IBladeInfo> = new Map();

    /**
     * Function called from the remove extension RPC call. Removes all the blades of an extension.
     * @param data 
     */
    private _onRemoveExtension(data: any): void {
        console.log('[TAP-FX] Removing extension with id of: ' + this._rpc.instanceId);

        // remove all the blades from the extension
        const blades = Array.from(this._bladeInfoMap.keys());
        if (blades.length > 0) {
            this._removeBladeRange(blades[0]).then((result) => {
                // if all blades were removed we will unsubscribe from all rpc subscriptions for the extension
                if (result) {
                    this._rpcSubscriptions.forEach((subscription) => {
                        subscription.unsubscribe();
                    });

                    // publish to the shell that this extension is ready to be removed.
                    const returnData: object = {
                        extensionId: this._rpc.instanceId
                    };
                    this._rpc.publish('shell.removeExtension', '', returnData);
                } else {
                    this._removeExtensionFailed();
                }
                
                return result;
            });
        }
    }

    /**
     * Publish to the shell that the removing of the extension failed.
     */
    private _removeExtensionFailed() {
        const returnData: object = {
            extensionId: this._rpc.instanceId
        };
        this._rpc.publish('shell.removeExtensionFailed', '', returnData);
    }

    /**
     * Function called from the update extension params RPC call. Will call the extensions updateParams if the developer has defined it.
     * @param data 
     */
    private _onUpdateExtensionParams(data: any): void {
        if (this.updateParams) {
            this.updateParams(data.params, data.queryParams);
        }
    }

    /**
     * Attempts to add a blade to an extension. Calls activation lifecycle hooks.
     * @param blade 
     */
    public addBlade(blade: BaseBlade): void {
        // create a journey promise which resolves to true
        let journeyPromise: Promise<boolean> = Promise.resolve(true);
        // if not journeying, we will want to remove the previous blade
        if (!this.journeyOn) {
            // though there should only be one blade ever with journey off (current implementation) we will still grab all blade mappings and get the latest in case our implementation changes in the future
            const bladeMappings = this._getBladeMappings();
            // only do this if we there are currently blades
            if (bladeMappings.length > 0) {
                // if removing the previous blade, set the journey promise to the result from that removal (whether it was successfully removed)
                const removedBlade = bladeMappings[bladeMappings.length - 1];
                journeyPromise = this._removeBladeRange(removedBlade.blade);
            }
        }

        journeyPromise.then((canAdd) => {
            if (canAdd) {
                this._bladeEngine.performActivation(blade).then((canActivate) => {
                    if (canActivate) {
                        this._performAddBlade(blade);
                    } else {
                        this._addBladeFailed();
                    }
                });
            } else {
                this._addBladeFailed();
            }
        });
    }

    /**
     * Function which performs the adding of a blade (since activation was successful). Publishes back to the shell that the blade was added.
     * @param blade 
     */
    private _performAddBlade(blade: BaseBlade): void {
        if (this._utilities.isNullOrWhiteSpace(blade.viewName)) {
            throw Error('All blades must have value for their viewName property');
        }
        const bladeInfo: IAddBladeMessage = this._registerBladeBindings(blade);
        // Get the extension Id from RPC and pass it to the shell
        bladeInfo.extensionId = this._rpc.instanceId;
        bladeInfo.viewName = blade.viewName;
        this._subscribeBladeRemoval(blade, bladeInfo.bladeId);
        
        this._bladeInfoMap.set(blade, { bladeId: bladeInfo.bladeId } );
        this._rpc.publish('shell.addBlade', '', bladeInfo);
    }

    /**
     * Register the blade's onRemoveClick function as subscription so that it
     * can be called from the shell over the RPC.
     * @param blade 
     * @param bladeId 
     */
    private _subscribeBladeRemoval(blade: BaseBlade, bladeId: string): void {
        const subscriptionArray: IRpcClientSubscription[] = [];

        // function subscription is all handled in the BindingEngine
        // Except for the onRemoveClick, which is subscribed here to know what blade is being removed
        const functionName = 'onRemoveClick';
        const subscriptionName = this._rpc.subscribe('tapfx.' + bladeId + '.' + functionName, (data) => {
            // call the _removeBladeRange function as a manual removal
            console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Received message from function: ` + functionName);
            this._removeBladeRange(blade, true);

            // publish a void result back to the shell so it doesn't keep listening
            const result = undefined;
            console.log(`[TAP-FX][${this._className}][${this._rpc.instanceId}] Publishing result from function: ` + functionName);
            this._rpc.publish('shell.' + bladeId + '.' + functionName, '', result);
        });

        // set any subscriptions to the _bladeSubscriptions map mapped by the blade id
        this._bladeSubscriptions.set(bladeId, [subscriptionName]);

        return ;
    }

    /**
     * Function which handles when an add blade event has failed. Publishes back to the shell that the add of a blade failed.
     */
    private _addBladeFailed(): void {
        const returnData: object = {
            extensionId: this._rpc.instanceId
        };
        this._rpc.publish('shell.addBladeFailed', '', returnData);
    }

    /**
     * Attempts to remove the passed blades from an extension.
     * @param blades
     */
    public removeBlades(...blades: BaseBlade[]): void {
        // find the earliest blade from the passed array and remove the range of blades starting with that blade
        const earliestBlade = this._findEarliestBlade(blades);
        if (earliestBlade) {
            this._removeBladeRange(earliestBlade);
        }
    }

    /**
     * Attempts to remove a range of blades based on the passed starting blade. Currently the ending blade of the range is always the latest blade. This removes the range of blades in descending order beginning with the ending blade of the range.
     * @param startingBlade
     * @param manualRemoval Whether the blade is being removed manually (by user interaction).
     * @return A promise which returns a whether the blades were removed.
     */
    private _removeBladeRange(startingBlade: BaseBlade, manualRemoval: boolean = false): Promise<boolean> {
        // find the id of the earliest blade which exists in the set of blades passed
        const startingBladeInfo = this._bladeInfoMap.get(startingBlade);
        if (!startingBladeInfo) {
            throw Error("Couldn't find starting blade for removal of blade range.");
        }

        const startingBladeId = startingBladeInfo.bladeId;
        const bladeMappings = this._getBladeMappings();
        // get the index of the starting blade id
        const sliceIndex = bladeMappings.findIndex((b) => {
            return b.bladeInfo.bladeId === startingBladeId;
        });
        // slice all blades after the earliest blade
        const removeMappings = bladeMappings.slice(sliceIndex);

        // start a removal chain
        let removalChain = Promise.resolve<boolean>(true);
        // keep track if this is the latest blade (max sequence)
        let isLatestBlade = true;
        removeMappings.reverse().forEach((bladeMapping) => {
            const blade = bladeMapping.blade;
            const bladeId = bladeMapping.bladeInfo.bladeId;
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
        // unobserve this blade (also unsubscribes from any blade events)
        this._bindingEngine.unobserveBlade(blade);

        // unsubscribe from blade OnRemoveClick event
        // All other blade event unsubscription is handled in the binding Engine
        (this._bladeSubscriptions.get(bladeId) || []).forEach((subscription) => {
            subscription.unsubscribe();
        });

        this._bladeInfoMap.delete(blade);
        this._bladeSubscriptions.delete(bladeId);

        // publish to the shell that this blade is ready to be removed
        const returnData: object = {
            extensionId: this._rpc.instanceId,
            bladeId,
            manualRemoval
        };
        this._rpc.publish('shell.removeBlade', '', returnData);
    }

    // TODO: determine what we need to implement for this and implement it.
    //       common scenerio which might be the cause of this would be because the user was prompted
    //       about unsaved changes and didn't want to leave, so the blade wouldn't be removed (canDeactivate would fail)
    private _removeBladeFailed() {
    }

    private _registerBladeBindings(blade: BaseBlade): IAddBladeMessage {
        const refIds: Set<string> = new Set<string>(); 
        const metadata: SerializedObject =  new SerializedObject();
        const serializedBlade = this._bindingEngine.observeObject(metadata, blade, refIds, this._rpc.instanceId, false, false, true);
        const result: IAddBladeMessage = {
            extensionId: '',
            bladeId: serializedBlade.contextId,
            viewName: '',
            serializedBlade,
            serializedViews: this._bindingEngine.getNewParsedViews()
        };
        return result;
    }

    /**
     * Gets the entries of the blade info map and maps them to an array of objects containing the mapping info.
     */
    private _getBladeMappings(): Array<{ blade: BaseBlade, bladeInfo: IBladeInfo }> {
        return Array.from(this._bladeInfoMap.entries()).map(ba => { 
            return { blade: ba[0], bladeInfo: ba[1] };
        });
    }

    /**
     * Based on an array of blades, find the earliest blade (earliest insertion) in that array which is mapped to this extension.
     * @param searchBlades 
     */
    private _findEarliestBlade(searchBlades: BaseBlade[]): BaseBlade | undefined {
        let earliestBlade: BaseBlade | undefined;
        // grab entries from the map (Map orders by insertion so they are in ascending order already), map this to a useful object
        const bladeMappings = this._getBladeMappings();
        // intercept the two arrays finding values which exist in both
        const interceptedBlades = bladeMappings.filter((bladeMapping) => searchBlades.indexOf(bladeMapping.blade) !== -1);
        // the earliest blade will be the first entry in this interception
        if (interceptedBlades.length > 0) {
            earliestBlade = interceptedBlades[0].blade;
        }

        return earliestBlade;
    }
}

import { inject } from 'aurelia-dependency-injection'
import RpcClient from './../../rpc/client'
import Extension from './extension'
import Blade from './../../ux/viewModels/viewModels.blade' // type only

@inject(Extension, RpcClient)
class ExtensionLoaderEngine {
    constructor(
        private _extension: Extension,
        private _rpc: RpcClient
    ) { }

    loadBlade(blade: Blade, serializedView: string): void {
        let bladeInfo = this._extension.registerBladeBindings(blade);
        // Get the extension Id from RPC and pass it to the shell
        bladeInfo.extensionId = this._rpc.InstanceId;
        bladeInfo.view = serializedView;
        this._rpc.publish('tapfx.newBlade', "", bladeInfo);
    }
}

export default ExtensionLoaderEngine;
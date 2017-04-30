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

    loadBlade(blade: Blade): void {
        this._extension.registerBladeBindings(blade);

        let serializedBlade = this._extension.serializeBlade(blade);

        this._rpc.publish('tapfx.newBlade', serializedBlade);
    }
}

export default ExtensionLoaderEngine;
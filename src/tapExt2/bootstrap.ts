/// <reference path="./../typings.d.ts" />
import {Aurelia} from 'aurelia-framework'
import {Index} from './index'

// Bootstrap the extension after tapFx is loaded
(function (tapFx) {
    if (!tapFx)
        document.addEventListener("TapFxReady", (e) => {
            startExtension(window.TapFx.Aurelia);
            delete(window.TapFx.Aurelia);
        });
    else {
        startExtension(window.TapFx.Aurelia);
        delete(window.TapFx.Aurelia);
    }

})(window.TapFx)

function startExtension(aurelia: Aurelia) : void {
    console.log('[EXT-BOOTSTRAP] startExtension');

    // call this to set the instance id for the extension (since it will be in an iframe)
    window.TapFx.Rpc.setInstanceId();

    aurelia.container.registerSingleton(Index, Index);
    let index = aurelia.container.get(Index);
    index.init();

    // if they have implemented update params, hook into it
    if (index.updateParams) window.TapFx.Extension.updateParams = index.updateParams;
}
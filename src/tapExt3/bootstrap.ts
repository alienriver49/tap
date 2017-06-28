/// <reference path="./../typings.d.ts" />
import {Aurelia} from 'aurelia-framework'
import {Index} from './index'

// Bootstrap the extension after tapFx is loaded
(function (tapFx){
    if (!tapFx)
        document.addEventListener("TapFxReady", (e) => {
            var dmf = e;
            startExtension(window.TapFx.Aurelia);
            delete(window.TapFx.Aurelia);
        });
    else{
        startExtension(window.TapFx.Aurelia);
        delete(window.TapFx.Aurelia);
    }

})(window.TapFx)

function startExtension(aurelia: Aurelia) : void {
    console.log('[EXT-3] startExtension');

    // If this instance is in an iframe, use the id attribute as the InstanceId for RPC
    if (window.self !== window.top){
        let iframeWindow = window.frameElement;
        if (!iframeWindow)
            throw new Error('Could not find frameElement');
        let id = iframeWindow.getAttribute("id") as string;
        if (!id)
            throw new Error('Could not find id attribute on iframe element');
        window.TapFx.Rpc.setInstanceId(id)
    }

     aurelia.container.registerSingleton(Index, Index);
     let index = aurelia.container.get(Index);
     index.init();
}


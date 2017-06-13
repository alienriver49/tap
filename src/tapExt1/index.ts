/// <reference path="./../typings.d.ts" />
import { bootstrap } from 'aurelia-bootstrapper'
import LandingBlade from './landingBlade'

bootstrap(aurelia => {
    console.log('[EXT-1] bootstrap');

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

     aurelia.container.registerSingleton(Init, Init);
     let init = aurelia.container.get(Init);

    // add the blade to extension manager
    let blade = new LandingBlade();
    blade.title = 'Title';
    blade.subtitle = 'Subtitle';
    blade.display = 'Title - Subtitle';
     // here's where we get the html for serializing 
    //  init.getView('tapExt1/landingBlade.html').then((serializedView) => {
    //     console.log('[EXT-1], got view', serializedView);
    //     init.addBlade(blade, serializedView);
    //  })
    init.addBlade(blade, "landingBlade.html");
});

class Init {
    constructor(
    ) {
    }

    public addBlade(blade: LandingBlade, viewName: string): void {
        console.log('[EXT-1] Attempting to add blade.');
        window.TapFx.Extension.addBlade(blade, viewName);
    }
}
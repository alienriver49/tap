import {Admin} from './admin'
import {init} from 'tap-fx'

init().then((tapFx) => {
    console.log('[EXT-BOOTSTRAP] startExtension');

    // call this to set the instance id for the extension (since it will be in an iframe)
    tapFx.Rpc.setInstanceId();

    tapFx.Aurelia.container.registerSingleton(Admin, Admin);
    let extension = tapFx.Aurelia.container.get(Admin);
    extension.init();

    tapFx.Extension.journeyOn = extension.journeyOn;
    // if they have implemented update params, hook into it
    if (extension.updateParams) tapFx.Extension.updateParams = extension.updateParams.bind(extension);

    //delete(tapFx.Aurelia);
});
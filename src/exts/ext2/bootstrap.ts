import { Index } from './index';
import { init } from 'tap-fx';

init().then((tapFx) => {
    console.log('[EXT-BOOTSTRAP] startExtension');

    // call this to set the instance id for the extension (since it will be in an iframe)
    tapFx.Rpc.setInstanceId();

    tapFx.Aurelia.container.registerSingleton(Index, Index);
    const index = tapFx.Aurelia.container.get(Index);
    index.init();

    tapFx.Extension.journeyOn = index.journeyOn;
    // if they have implemented update params, hook into it
    if (index.updateParams) {
        tapFx.Extension.updateParams = index.updateParams.bind(index);
    }

    //delete(tapFx.Aurelia);
});

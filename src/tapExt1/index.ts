import LandingBlade from './landingBlade'

((TapFx) => {
    console.log('[EXT-1] Attempting to add blade.');

    var landingBlade = new LandingBlade();
    landingBlade.title = 'Title';
    landingBlade.subtitle = 'Subtitle';
    landingBlade.display = 'Title - Subtitle';

    TapFx.ExtensionManager.addBlade(landingBlade);

    // setTimeout(() => {
    //     console.log('[EXT-1] Attempting to update title.');
    //     landingBlade.title = 'I_HAVE_UDPATED_TITLE';
    // }, 2500);
})(window.TapFx);
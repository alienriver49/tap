import LandingBlade from './landingBlade'

(() => {
    var TapFx = window['TapFx'];

    console.log('The extension is loaded.');
    console.log('Attempting to add blade...');

    var landingBlade = new LandingBlade();
    landingBlade.title = 'My First Landing Blade';
    landingBlade.subtitle = 'That is how you know that Extension-1 has made it';

    TapFx.ExtensionManager.addBlade(landingBlade);

    setTimeout(() => {
        console.log('attempting to update title');
        landingBlade.title = 'I_HAVE_UDPATED_TITLE';
    }, 1000);
})();
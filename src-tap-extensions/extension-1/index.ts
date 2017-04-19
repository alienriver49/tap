import LandingBlade from './landing-blade'

(() => {
    console.log('The extension is loaded.');
    console.log('Attempting to add blade...');

    var TapFx = window['TapFx'];

    var landingBlade = new LandingBlade();
    landingBlade.title = 'My First Landing Blade';
    landingBlade.subtitle = 'That is how you know that Extension-1 has made it';

    TapFx.ExtensionManager.addBlade(landingBlade);
})();
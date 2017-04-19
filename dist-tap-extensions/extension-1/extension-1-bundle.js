class LandingBlade {
    titleChanged(newValue, oldValue) {
        console.log('Now...the Blade...knows that the title has changed.');
    }
    subtitleChanged(newValue, oldValue) {
        console.log('Now...the Blade...knows that the subtitle has changed.');
    }
}

(() => {
    console.log('The extension is loaded.');
    console.log('Attempting to add blade...');
    var TapFx = window['TapFx'];
    var landingBlade = new LandingBlade();
    landingBlade.title = 'My First Landing Blade';
    landingBlade.subtitle = 'That is how you know that Extension-1 has made it';
    TapFx.ExtensionManager.addBlade(landingBlade);
})();

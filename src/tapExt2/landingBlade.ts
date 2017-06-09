class LandingBlade extends window.TapFx.ViewModels.Blade {
    title: string;
    subtitle: string;
    display: string;

    constructor() { 
        super();
    }
    private _updateDisplay() {
        this.display = this.title !== this.subtitle ? 'NOT MATCHING' : 'MATCHING';
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-2] Blade title has changed.');
        this._updateDisplay();
    }

    subtitleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-2] Blade subtitle has changed.')
        this._updateDisplay();
    }
}

export default LandingBlade
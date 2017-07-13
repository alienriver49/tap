
class LandingBlade extends window.TapFx.ViewModels.BaseBlade {
    title: string;
    subtitle: string;
    display: string;

    constructor() {
        super();
    }

    /**
     * Blade activation (initialization);
     */
    activate() {
        this.title = 'Title';
        this.subtitle = 'Subtitle';
        this.display = this.title + ' - ' + this.subtitle;
    }

    private _updateDisplay() {
        this.display = this.title === this.subtitle ? 'MATCHING' : `${this.title} - ${this.subtitle}`
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Blade title has changed.');
        this._updateDisplay();
    }

    subtitleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Blade subtitle has changed.')
        this._updateDisplay();
    }
}

export default LandingBlade 
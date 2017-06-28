
class SecondBlade extends window.TapFx.ViewModels.Blade {
    title: string;
    subtitle: string;
    display: string;
    queryParams: string;

    constructor() {
        super();
    }
    private _updateDisplay() {
        this.display = this.title === this.subtitle ? 'MATCHING' : `${this.title} - ${this.subtitle}`
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Second blade title has changed.');
        this._updateDisplay();
    }

    subtitleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Second blade subtitle has changed.')
        this._updateDisplay();
    }
}

export default SecondBlade 
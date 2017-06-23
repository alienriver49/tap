
class LandingBlade extends window.TapFx.ViewModels.Blade {
    title: string;
    display: string;
    raised: boolean = false;
    clearText: boolean = false;

    constructor() {
        super();
    }
    private _updateDisplay() {
        this.display = this.title ? '[ADDED] ' + this.title : '';
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-3] Blade title has changed.');
        this._updateDisplay();
    }

    clearTextChanged(newValue: string, oldValue: string): void {
        if (newValue){
            this.title = '';
            this.clearText = false;
        }
    }
}

export default LandingBlade 
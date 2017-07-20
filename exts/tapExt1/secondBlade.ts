import {ViewModels} from './../tapFx'

class SecondBlade extends ViewModels.BaseBlade {
    title: string;
    subtitle: string;
    display: string;
    queryParams: string;
    canClose: boolean;

    constructor() {
        super();
    }

    /**
     * Blade activation (initialization);
     */
    activate(): void {
        this.title = 'Second Blade';
        this.display = this.title + ' - ' + this.subtitle;
        this.canClose = true;
    }

    canDeactivate(): boolean {
        return this.canClose;
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
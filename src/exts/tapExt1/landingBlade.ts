import {ViewModels, Utilities} from 'tap-fx'
import * as tapfx from './../../tapFx/ux/tapcModules'

class LandingBlade extends ViewModels.FormBlade {
    title: string;
    subtitle: string;
    display: string;

    constructor() {
        super();
        this._buildContent();
        let utils = new Utilities();
        console.log('utils.newGuid()', utils.newGuid());
    }

    private _buildContent(): void {        
        this.addForm()
                .addLabelInput(
                    new tapfx.tapcLabel({for: 'title'}).addText('Title:'),
                    new tapfx.tapcInput({name: 'title', value: '@title'}),
                )
                .addLabelInput(
                    new tapfx.tapcLabel({for: 'subtitle'}).addText('Subtitle:'),
                    new tapfx.tapcInput({name: 'subtitle', value: '@subtitle'}), // TODO: missing trigger on blur binding behaviour
                )
                .addToContainer(
                    new tapfx.tapcDiv().addToContainer(
                        new tapfx.tapcLabel({for: 'display'}).addText('Display:'),
                        new tapfx.tapcText({text: '@display'}),
                    )
                );
    }

    /**
     * Blade activation (initialization);
     */
    activate(): void {
        this.title = 'Title';
        this.subtitle = 'Subtitle';
        this.display = this.title + ' - ' + this.subtitle;
    }

    private _updateDisplay(): void {
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
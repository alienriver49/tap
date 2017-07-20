import {ViewModels} from './../tapFx'
import * as tapfx from './../tapFx/ux/tapcModules'

class SecondBlade extends ViewModels.FormBlade {
    title: string;
    subtitle: string;
    display: string;
    queryParams: string;
    canClose: boolean;

    constructor() {
        super();
        this._buildContent();
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
                )
                .addToContainer(
                    new tapfx.tapcDiv().addToContainer(
                        new tapfx.tapcLabel({for: 'queryParams'}).addText('Query Params:'),
                        new tapfx.tapcText({text: '@queryParams'}),
                    )
                )
                // Note: slightly different than the original template, adds a label with 'Can Close?' instead of having it inline to the right of the checkbox, though we may want both
                .addLabelInput( 
                    new tapfx.tapcLabel({for: 'canClose'}).addText('Can Close?'),
                    new tapfx.tapcInput({name: 'canClose', type: tapfx.InputType.Checkbox, value: 'true', checked: '@canClose'}),
                );
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

    private _updateDisplay(): void {
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
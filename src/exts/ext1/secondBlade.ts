import { ViewModels } from 'tap-fx';
import * as tapc from './../../fx/ux/tapcModules';

export class SecondBlade extends ViewModels.FormBlade {
    public title: string;
    public subtitle: string;
    public display: string;
    public queryParams: string;
    public canClose: boolean;

    constructor() {
        super();
        this._buildContent();
    }

    private _buildContent(): void {
        this.addForm()
                .addLabelInput(
                    new tapc.Label({for: 'title'}).addText('Title:'),
                    new tapc.Input({name: 'title', value: '@title'}),
                )
                .addLabelInput(
                    new tapc.Label({for: 'subtitle'}).addText('Subtitle:'),
                    new tapc.Input({name: 'subtitle', value: '@subtitle'}), // TODO: missing trigger on blur binding behaviour
                )
                .addToContainer(
                    new tapc.Content().addToContainer(
                        new tapc.Label({for: 'display'}).addText('Display:'),
                        new tapc.Text({text: '@display'}),
                    )
                )
                .addToContainer(
                    new tapc.Content().addToContainer(
                        new tapc.Label({for: 'queryParams'}).addText('Query Params:'),
                        new tapc.Text({text: '@queryParams'}),
                    )
                )
                // Note: slightly different than the original template, adds a label with 'Can Close?' instead of having it inline to the right of the checkbox, though we may want both
                .addLabelInput( 
                    new tapc.Label({for: 'canClose'}).addText('Can Close?'),
                    new tapc.Input({name: 'canClose', type: tapc.InputType.CHECKBOX, value: 'true', checked: '@canClose'}),
                );
    }

    /**
     * Blade activation (initialization);
     */
    public activate(): void {
        this.title = 'Second Blade';
        this.display = this.title + ' - ' + this.subtitle;
        this.canClose = true;
    }

    public canDeactivate(): boolean {
        return this.canClose;
    }

    private _updateDisplay(): void {
        this.display = this.title === this.subtitle ? 'MATCHING' : `${this.title} - ${this.subtitle}`;
    }

    public titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Second blade title has changed.');
        this._updateDisplay();
    }

    public subtitleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Second blade subtitle has changed.');
        this._updateDisplay();
    }
}

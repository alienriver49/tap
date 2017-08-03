import { ViewModels } from 'tap-fx';
import * as tapc from './../../fx/ux/tapcModules';

export class LandingBlade extends ViewModels.FormBlade {
    public title: string;
    public subtitle: string;
    public display: string;

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
                );
    }

    /**
     * Blade activation (initialization);
     */
    public activate(): void {
        this.title = 'Title';
        this.subtitle = 'Subtitle';
        this.display = this.title + ' - ' + this.subtitle;
    }

    private _updateDisplay(): void {
        this.display = this.title === this.subtitle ? 'MATCHING' : `${this.title} - ${this.subtitle}`;
    }

    public titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Blade title has changed.');
        this._updateDisplay();
    }

    public subtitleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-1] Blade subtitle has changed.');
        this._updateDisplay();
    }
}

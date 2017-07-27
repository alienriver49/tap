import {ViewModels} from 'tap-fx'
import * as tapc from './../../tapFx/ux/tapcModules'

export class InvoicesBrowseBlade extends ViewModels.BrowseBlade {
    title: string;
    subtitle: string;
    display: string;

    constructor() {
        super();
        this._buildContent();
    }

    private _buildContent(): void {
        this.addActionButtons(
            new tapc.Button({name: 'new'}).addIcon('glyphicon-plus-sign').addText('New'),
            new tapc.Button({name: 'refresh'}).addIcon('glyphicon-repeat').addText('Refresh')
        );
    }

    /**
     * Blade activation (initialization);
     */
    activate(): void {
        this.title = 'Invoices';
        this.subtitle = '';
    }

    onButtonNewClicked(): void {
        console.log('[Invoices-Browse] New clicked');
    }

    onButtonRefreshClicked(): void {
        console.log('[Invoices-Browse] Refresh clicked')
    }
}
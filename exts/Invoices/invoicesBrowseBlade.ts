import {getTapFx, ViewModels} from 'tap-fx'
import * as tapc from './../../tapFx/ux/tapcModules'
import {ITapDataTableColumnConfiguration} from './../../webComponents/dataTable/tap-data-table'
import {InvoicesAddBlade} from './invoicesAddBlade'

interface IInvoiceBrowseDto {
    //Invoices: IInvoiceDto[];
    Skip: number;
    Take: number;
    Total: number;
}

interface IInvoiceDto {
    Date: Date;
    Description: string;
    Amount: number;
}

export class InvoicesBrowseBlade extends ViewModels.BrowseBlade {
    private _tapFx: ITapFx;

    private _addInvoiceBlade: BaseBlade;

    title: string;
    subtitle: string;
    display: string;

    invoices: IInvoiceDto[];
    invoiceBrowse: IInvoiceBrowseDto = {
        //Invoices: [],
        Skip: 0,
        Take: 10,
        Total: 100
    }
    columnConfig: ITapDataTableColumnConfiguration[] = [
        {header: 'Date', property: 'Date', filter: 'date'},
        {header: 'Description', property: 'Description'},
        {header: 'Amount', headerClass: 'text-right', property: 'Amount', filter: 'currency', columnClass: 'text-right'}
    ]

    constructor() {
        super();
        this._tapFx = getTapFx();
        this._buildContent();
    }

    private _buildContent(): void {
        this.addActionButtons(
            new tapc.Button({name: 'new'}).addIcon('glyphicon-plus-sign').addText('New'),
            new tapc.Button({name: 'refresh'}).addIcon('glyphicon-repeat').addText('Refresh')
        );

        this.addDataTable(
            new tapc.DataTable({id: 'invoices-browse-table', title: 'Invoices', totalItems: '@invoiceBrowse.Total', data: '@invoices'}).setColumnConfiguration(this.columnConfig, '@columnConfig')
        );
    }

    private _getInvoices(): Promise<void> {
        console.log('[Invoices-Browse] Getting invoices');
        // fake loading of invoices
        let timeout: number = 250;
        let promise = new Promise<undefined>((resolve) => {
            this.invoices = [];
            for (let i = 0 ; i < this.invoiceBrowse.Take ; i++) {
                this.invoices[i] = {
                    Date: new Date(2017, this._tapFx.Utilities.getRandomInt(0, 11), this._tapFx.Utilities.getRandomInt(0, 27)),
                    Description: this._tapFx.Utilities.getRandomNoun(),
                    Amount: Number((this._tapFx.Utilities.getRandomInt(1,10000) * Math.random()).toFixed(2))
                };
            }
            
            setTimeout(resolve, timeout);
        });
        return promise;
    }

    /**
     * Blade activation (initialization);
     */
    activate(): Promise<void> {
        this.title = 'Invoices';
        this.subtitle = '';

        return this._getInvoices();
    }

    onButtonNewClicked(): void {
        console.log('[Invoices-Browse] New clicked');
        // TODO: make sure th
        let addInvoiceBlade = new InvoicesAddBlade();
        this._tapFx.Extension.addBlade(addInvoiceBlade, '');
    }

    onButtonRefreshClicked(): void {
        console.log('[Invoices-Browse] Refresh clicked');
        this._getInvoices();
    }
}
import {getTapFx, ViewModels} from 'tap-fx'
import * as tapc from './../../tapFx/ux/tapcModules'

interface IInvoiceDto {
    InvoiceDate: Date;
    DueDate: Date;
    VendorAddress: string;
    Description: string;
    PaymentMethod: string;
}

export class InvoicesAddBlade extends ViewModels.FormBlade {
    private _tapFx: ITapFx;

    title: string;
    subtitle: string;
    display: string;

    invoice: IInvoiceDto;

    constructor() {
        super();
        this._tapFx = getTapFx();
        this._buildContent();
    }

    private _buildContent(): void {
        this.addMenu(
            new tapc.Button({name: 'expense'}).addText('Expense Information'),
            new tapc.Button({name: 'items'}).addText('Items'),
            new tapc.Button({name: 'allocations'}).addText('Allocations'),
            new tapc.Button({name: 'attachments'}).addText('Attachments'),
        );

        this.content.push(new tapc.Content().addClass('cline'));
    }

    private _getInvoiceData(): Promise<void> {
        console.log('[Invoices-Add] Getting invoice information');
        // fake loading of invoices
        let timeout: number = 250;
        let promise = new Promise<undefined>((resolve) => {
            this.invoice;
            
            setTimeout(resolve, timeout);
        });
        return promise;
    }

    /**
     * Blade activation (initialization);
     */
    activate(): Promise<void> {
        this.title = 'Add Invoice';
        this.subtitle = '';

        return this._getInvoiceData();
    }
}
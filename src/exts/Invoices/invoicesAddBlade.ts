import { getTapFx, ViewModels } from 'tap-fx';
import * as tapc from '../../fx/ux/tapcModules';

interface IInvoiceDto {
    InvoiceDate: Date;
    DueDate: Date;
    VendorAddress: string;
    Description: string;
    PaymentMethod: string;
}

export class InvoicesAddBlade extends ViewModels.FormBlade {
    private _tapFx: ITapFx;

    public title: string;
    public subtitle: string;
    public display: string;

    public invoice: IInvoiceDto;

    public paymentMethods: string[] = [
        'Check',
        'Electronic Funds',
        'Direct Disbursement'
    ];

    constructor() {
        super();
        this.viewName = 'invoicesAddBlade.html';
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

        this.addMenuContent(
            new tapc.Form()
                .addLabelInput(
                    new tapc.Label({for: 'invoiceDate'}).addText('Invoice Date'),
                    new tapc.Input({name: 'invoiceDate', type: tapc.InputType.DATE})
                )
                .addLabelInput(
                    new tapc.Label({for: 'dueDate'}).addText('Due Date'),
                    new tapc.Input({name: 'dueDate', type: tapc.InputType.DATE})
                )
                .addLabelInput(
                    new tapc.Label({for: 'vendorAddress'}).addText('Vendor Address'),
                    new tapc.TextArea({name: 'vendorAddress'})
                )
                .addLabelInput(
                    new tapc.Label({for: 'description'}).addText('Description'),
                    new tapc.TextArea({name: 'description'})
                )
                .addToContainer(
                    new tapc.Label({for: 'paymentMethods'}).addText('Payment Method'),
                    new tapc.Content({repeat: 'paymentMethod of paymentMethods'}).addToContainer(
                        new tapc.Input({name: 'paymentMethods', type: tapc.InputType.RADIO, model: '@paymentMethod', checked: '@selectedPaymentMethod'}),
                        new tapc.Text({text: ' '}),
                        new tapc.Text({text: '@paymentMethod'})
                    ),
                )
        );

        this.content.push(new tapc.Content().addClass('cline'));
    }

    private _getInvoiceData(): Promise<void> {
        console.log('[Invoices-Add] Getting invoice information');
        // fake loading of invoices
        const timeout: number = 250;
        const promise = new Promise<undefined>((resolve) => {
            setTimeout(resolve, timeout);
        });
        return promise;
    }

    /**
     * Blade activation (initialization);
     */
    public activate(): Promise<void> {
        this.title = 'Add Invoice';
        this.subtitle = '';

        return this._getInvoiceData();
    }
}

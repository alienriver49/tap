/// <reference path="./../../typings.d.ts" />
import {InvoicesBrowseBlade} from './invoicesBrowseBlade'
import { BaseBlade } from './../../tapFx/ux/viewModels/viewModels.baseBlade'; // TODO: remove this and use a typing
import {getTapFx, BaseExtension} from 'tap-fx'
import {InvoicesAddBlade} from './invoicesAddBlade'

export class Invoices extends BaseExtension {
    constructor(
    ) {
        super();
        this._tapFx = getTapFx();
    }

    private _tapFx: ITapFx;

    addInvoiceBlade: InvoicesAddBlade;

    public init(): void {
        console.log('[Invoices] Index.init');
        let blade = new InvoicesBrowseBlade();
        this.addBlade(blade, "landingBlade.html");
    }

    public updateParams(params: any[], queryParams: Object): void {
        console.log('[Invoices] Updating extension parameters.');

        if (params[0] === 'AddInvoice') {
            this.addInvoiceBlade = new InvoicesAddBlade();
            this.addBlade(this.addInvoiceBlade, '');
        }

    }

    public addBlade(blade: BaseBlade, viewName: string): void {
        console.log('[Invoices] Attempting to add blade.');
        this._tapFx.Extension.addBlade(blade, viewName);
    }
}
import { BaseBlade, IBaseBlade } from './viewModels.baseBlade';
import * as tapc from './../tapcModules';
import { IButton } from './../components/Button';
import { IDataTable } from './../components/DataTable';

export interface IBrowseBlade extends IBaseBlade {
    addActionButtons(...buttons: IButton[]): void;
    addDataTable(dataTable: IDataTable): void;
}

export class BrowseBlade extends BaseBlade implements IBrowseBlade {
    constructor() {
        super();
    }

    /**
     * Add the action buttons to a browse blade.
     * @param buttons 
     */
    public addActionButtons(...buttons: IButton[]): void {
        this.content.push(
            new tapc.Content().addClass('blade-action-bar').addToContainer(
                ...buttons
            )
        );
    }
    
    public addDataTable(dataTable: IDataTable): void {
        this.content.push(dataTable);
    }
}

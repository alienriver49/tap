import { BaseElement, IBaseElement, IBaseElementConfig } from './baseElement';
import { ITapDataTableColumnConfiguration } from './../../../webComponents/dataTable/tap-data-table';
import { AttributeMetadata } from './../metadata/attributeMetadata';

export interface IDataTableConfig extends IBaseElementConfig {
    title?: string;
    totalItems?: string;
    data?: string;
}

export interface IDataTable extends IBaseElement {
    attributeTitle: string;
    attributeTotalItems: string;
    attributeData: string;
    attributeColumnConfiguration: string;
    setColumnConfiguration(columnConfig: ITapDataTableColumnConfiguration[], bindingName: string): this;
}

/**
 * Data table UX component.
 */
export class DataTable extends BaseElement implements IDataTable {
    constructor(config?: IDataTableConfig) {
        if (config === void 0) { 
            config = {}; 
        }

        super(config);

        this.attributeTitle = config.title || '';
        this.attributeTotalItems = config.totalItems || '';
        this.attributeData = config.data || '';
    }

    private _attributeColumnConfiguration: string;

    @AttributeMetadata.set('title')
    public attributeTitle: string;
    
    @AttributeMetadata.set('totalItems')
    public attributeTotalItems: string;

    @AttributeMetadata.set('data')
    public attributeData: string;

    /**
     * To add datatype checking, the column configuration can only be set through this function
     * @param columnConfig 
     * @param bindingName 
     */
    public setColumnConfiguration(columnConfig: ITapDataTableColumnConfiguration[], bindingName: string): this {
        if (!columnConfig) {
            throw new Error('tapcDataTable: columnConfiguration is not valid');
        }

        this._attributeColumnConfiguration = bindingName;

        return this;
    }

    // ES6 style getters are defined on the prototype
    @AttributeMetadata.set('columnConfiguration')
    public get attributeColumnConfiguration() {
        return this._attributeColumnConfiguration;
    }
}

import {BaseElement, IBaseElement, IBaseElementConfig} from './BaseElement'
import {ITapDataTableColumnConfiguration} from './../../../webComponents/dataTable/tap-data-table'

export interface IDataTableConfig extends IBaseElementConfig {
    attributeData?: string;
}

export interface IDataTable extends IBaseElement {
    attributeData: string;
    attributeColumnConfiguration: string;
    setColumnConfiguration(columnConfig: ITapDataTableColumnConfiguration[], bindingName: string): this;
}

/**
 * Data table UX component.
 */
export class DataTable extends BaseElement implements IDataTable {
    constructor(config?: IDataTableConfig) {
        if (config === void 0) { config = {}; }
        super(config);

        this.attributeData = config.attributeData || '';
    }

    private _attributeColumnConfiguration: string; 
    attributeData: string;

    /**
     * To add datatype checking, the column configuration can only be set through this function
     * @param columnConfig 
     * @param bindingName 
     */
    public setColumnConfiguration(columnConfig: ITapDataTableColumnConfiguration[], bindingName: string): this {
        if (!columnConfig)
            throw new Error('tapcDataTable: columnConfiguration is not valid');
        this._attributeColumnConfiguration = bindingName;

        return this;
    }

    // ES6 style getters are defined on the prototype
    public get attributeColumnConfiguration() {
        return this._attributeColumnConfiguration;
    }
}
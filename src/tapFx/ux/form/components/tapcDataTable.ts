import {tapcBase, ITapcBase} from './tapcBase'
import {ITapDataTableColumnConfiguration} from './../../../../webComponents/dataTable/tap-data-table'

export interface ITapcDataTableConfig extends ITapcBase {
    attributeData?: string;
}

export class tapcDataTable extends tapcBase{

    constructor(config?: ITapcDataTableConfig){
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
    public setColumnConfiguration(columnConfig: ITapDataTableColumnConfiguration[], bindingName: string){
        if (!columnConfig)
            throw new Error('tapcDataTable: columnConfiguration is not valid');
        this._attributeColumnConfiguration = bindingName;
    }

    // ES6 style getters are defined on the prototype
    public get attributeColumnConfiguration(){
        return this._attributeColumnConfiguration;
    }

}
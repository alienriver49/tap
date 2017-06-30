import {tapcBase, ITapcBase} from './tapcBase'

export interface ITapcDataTableConfig extends ITapcBase {
    attributeHeaders?: string;
    attributeData?: string;
}

export class tapcDataTable extends tapcBase{

    constructor(config?: ITapcDataTableConfig){
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeHeaders = config.attributeHeaders || '';
        this.attributeData = config.attributeData || '';
    }

    attributeHeaders: string; 
    attributeData: string;
}

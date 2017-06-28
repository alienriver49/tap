
import {tapcBase, ITapcBase} from './tapcBase'

export interface ITapcMdcCheckbox extends ITapcBase {
    isChecked?: string;
    display?: string;
}

export class tapcMdcCheckbox extends tapcBase{

    constructor(config?: ITapcMdcCheckbox){
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeIsChecked = config.isChecked || '';
        this.attributeDisplay = config.display || '';
    }

    attributeIsChecked: string;
    attributeDisplay: string;
}

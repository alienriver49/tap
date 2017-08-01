import {tapcBase, ITapcBaseConfig} from './tapcBase'

export interface ITapcMdcCheckboxConfig extends ITapcBaseConfig {
    isChecked?: string;
    display?: string;
}

export class tapcMdcCheckbox extends tapcBase {
    constructor(config?: ITapcMdcCheckboxConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeIsChecked = config.isChecked || '';
        this.attributeDisplay = config.display || '';
    }

    attributeIsChecked: string;
    attributeDisplay: string;
}
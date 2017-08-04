import { BaseElement, IBaseElement, IBaseElementConfig } from './BaseElement';
import { AttributeMetadata } from './../metadata/attributeMetadata';

export interface IMdcCheckboxConfig extends IBaseElementConfig {
    isChecked?: string;
    display?: string;
}

export interface IMdcCheckbox extends IBaseElement {
    attributeIsChecked: string;
    attributeDisplay: string;
}

export class MdcCheckbox extends BaseElement implements IMdcCheckbox {
    constructor(config?: IMdcCheckboxConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeIsChecked = config.isChecked || '';
        this.attributeDisplay = config.display || '';
    }

    @AttributeMetadata.Set('isChecked')
    public attributeIsChecked: string;

    @AttributeMetadata.Set('display')
    public attributeDisplay: string;
}

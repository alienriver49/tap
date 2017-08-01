import {tapcBase, ITapcBaseConfig} from './tapcBase'

export interface ITapcInputConfig extends ITapcBaseConfig {
    type?: /*InputType*/string;
    value?: string;
    checked?: string;
    /* Specific to binding frameworks (i.e. Aurelia's binding engine) */
    model?: string; // TODO: the only difference between value and model binding is that value is for string values and model for objects, can we simplify this for developers?
}

// note: TypeScript 2.4 allows string enums
/*export const enum InputType {
    Text = 'text',
    Password = 'password',
    Checkbox = 'checkbox',
    Radio = 'radio',
    File = 'file',
}*/

export class InputType {
    public static readonly Text: string = "text";
    public static readonly Password: string = "password";
    public static readonly Checkbox: string = "checkbox";
    public static readonly Radio: string = "radio";
    public static readonly File: string = "checkbox";
}

export class tapcInput extends tapcBase {
    constructor(config?: ITapcInputConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeType = config.type || InputType.Text;
        this.attributeValue = config.value || '';
        this.attributeChecked = config.checked || '';
        this.attributeModel = config.model || '';
    }

    attributeType: string;
    attributeValue: string;
    attributeChecked: string;
    attributeModel: string;
}

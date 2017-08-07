import { BaseElement, IBaseElement, IBaseElementConfig } from './baseElement';
import { AttributeMetadata } from '../metadata/attributeMetadata';

export interface IInputConfig extends IBaseElementConfig {
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
    public static readonly TEXT: string = 'text';
    public static readonly PASSWORD: string = 'password';
    public static readonly CHECKBOX: string = 'checkbox';
    public static readonly RADIO: string = 'radio';
    public static readonly FILE: string = 'checkbox';
    public static readonly DATE: string = 'date';
}

export interface IInput extends IBaseElement {
    attributeType: string;
    attributeValue: string;
    attributeChecked: string;
    attributeModel: string;
}

/**
 * Input UX component for taking input from the user.
 */
export class Input extends BaseElement implements IInput {
    constructor(config?: IInputConfig) {
        if (config === void 0) { 
            config = {}; 
        }

        super(config);
        this.attributeType = config.type || InputType.TEXT;
        this.attributeValue = config.value || '';
        this.attributeChecked = config.checked || '';
        this.attributeModel = config.model || '';
    }

    @AttributeMetadata.set('type')
    public attributeType: string;

    @AttributeMetadata.set('value')
    public attributeValue: string;

    @AttributeMetadata.set('checked')
    public attributeChecked: string;

    @AttributeMetadata.set('model')
    public attributeModel: string;
}

import {BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig} from './BaseElementContainer'

export interface IOptionConfig extends IBaseElementContainerConfig {
    disabled?: string;
    selected?: string;
    value?: string;
    /* Specific to binding frameworks (i.e. Aurelia's binding engine) */
    model?: string; // TODO: the only difference between value and model binding is that value is for string values and model for objects, can we simplify this for developers?
}

export interface IOption extends IBaseElementContainer {
    attributeDisabled: string;
    attributeSelected: string;
    attributeValue: string;
    attributeModel: string;
}

/**
 * Option UX component for defining an option in a Select component.
 */
export class Option extends BaseElementContainer implements IOption {
    constructor(config?: IOptionConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeDisabled = config.disabled || '';
        this.attributeSelected = config.selected || '';
        this.attributeValue = config.value || '';
        this.attributeModel = config.model || '';
    }

    attributeDisabled: string;
    attributeSelected: string;
    attributeValue: string;
    attributeModel: string;
}

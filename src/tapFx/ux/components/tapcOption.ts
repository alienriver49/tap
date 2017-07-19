import {tapcBaseContainer, ITapcBaseContainerConfig} from './tapcBaseContainer'

export interface ITapcOptionConfig extends ITapcBaseContainerConfig {
    disabled?: string;
    selected?: string;
    value?: string;
    /* Specific to binding frameworks (i.e. Aurelia's binding engine) */
    model?: string; // TODO: the only difference between value and model binding is that value is for string values and model for objects, can we simplify this for developers?
}

export class tapcOption extends tapcBaseContainer {
    constructor(config?: ITapcOptionConfig) {
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

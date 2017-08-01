import {tapcBaseContainer, ITapcBaseContainerConfig} from './tapcBaseContainer'
import {tapcOption} from './tapcOption'

export interface ITapcSelectConfig extends ITapcBaseContainerConfig {
    multiple?: string;
    /* Specific to binding frameworks (i.e. Aurelia's binding engine) */
    value?: string;
}

export class tapcSelect extends tapcBaseContainer {
    constructor(config?: ITapcSelectConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeMultiple = config.multiple || '';
        this.attributeValue = config.value || '';
    }

    content: tapcOption[];

    attributeMultiple: string;
    attributeValue: string;

    /**
     * Chainable method for adding options to a select.
     * @param content 
     * @chainable
     * @override
     */
    addToContainer(...content: tapcOption[]): this {
        super.addToContainer(...content);

        return this;
    }
}

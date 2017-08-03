import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './BaseElementContainer';
import { BaseElement } from './BaseElement';
import { IOption } from './Option';

export interface ISelectConfig extends IBaseElementContainerConfig {
    multiple?: string;
    /* Specific to binding frameworks (i.e. Aurelia's binding engine) */
    value?: string;
}

export interface ISelect extends IBaseElementContainer {
    content: IOption[];
    attributeMultiple: string;
    attributeValue: string;
}

/**
 * Select UX component for defining a selection of options the user can select.
 */
export class Select extends BaseElementContainer implements ISelect {
    constructor(config?: ISelectConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeMultiple = config.multiple || '';
        this.attributeValue = config.value || '';
    }

    public content: IOption[];

    @BaseElement.tapcAttribute('multiple')
    public attributeMultiple: string;

    @BaseElement.tapcAttribute('value')
    public attributeValue: string;

    /**
     * Chainable method for adding options to a select.
     * @param content 
     * @chainable
     * @override
     */
    public addToContainer(...content: IOption[]): this {
        super.addToContainer(...content);

        return this;
    }
}

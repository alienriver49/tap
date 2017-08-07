import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './baseElementContainer';
import { IOption } from './option';
import { AttributeMetadata } from '../metadata/attributeMetadata';

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
        if (config === void 0) { 
            config = {}; 
        }

        super(config);
        this.attributeMultiple = config.multiple || '';
        this.attributeValue = config.value || '';
    }

    public content: IOption[];

    @AttributeMetadata.set('multiple')
    public attributeMultiple: string;

    @AttributeMetadata.set('value')
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

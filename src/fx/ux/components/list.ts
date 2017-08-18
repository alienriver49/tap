import { IBaseElement } from './baseElement';
import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './baseElementContainer';
import { IListItem } from './listItem';

export interface IListConfig extends IBaseElementContainerConfig {
    isOrdered?: boolean;
}

export interface IList extends IBaseElementContainer {
    content: Array<IListItem|IBaseElement>;
    isOrdered: boolean;
}

/**
 * List UX component for defining a List.
 */
export class List extends BaseElementContainer implements IList {
    constructor(config?: IListConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        
        super(config);

        this.isOrdered = config.isOrdered !== void(0) ? config.isOrdered : false;
    }

    public content: Array<IListItem|IBaseElement>;

    /**
     * Should it be an ordered or unordered list?
     */
    public isOrdered: boolean;

    /**
     * Chainable method for adding items to a list.
     * If using a repeat-for, only one item should be added and it will be
     * rendered as a template for the repeat
     * @param content 
     * @chainable
     * @override
     */
    public addToContainer(...content: Array<IListItem|IBaseElement>): this {
        super.addToContainer(...content);

        return this;
    }
}

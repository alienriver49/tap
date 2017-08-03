import {BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig} from './BaseElementContainer'
import {BaseElement} from './BaseElement'
import {Text} from './Text'
import {IListItem} from './ListItem'

export interface IListConfig extends IBaseElementContainerConfig {
    isOrdered?: boolean;
}

export interface IList extends IBaseElementContainer {
    isOrdered: boolean;
}

/**
 * List UX component for defining a List.
 */
export class List extends BaseElementContainer implements IList {
    constructor(config?: IListConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.isOrdered = config.isOrdered !== void(0) ? config.isOrdered : true;
    }

    // Should it be an ordered or unordered list?
    isOrdered: boolean;


    /**
     * Chainable method for adding items to a list.
     * If using a repeat-for, only one item should be added and it will be
     * rendered as a template for the repeat
     * @param content 
     * @chainable
     * @override
     */
    addToContainer(...content: IListItem[]): this {
        super.addToContainer(...content);

        return this;
    }
}

import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './BaseElementContainer';
import { BaseElement } from './BaseElement';

export interface IListItemConfig extends IBaseElementContainerConfig {
}

export interface IListItem extends IBaseElementContainer {
}

/**
 * ListItem UX component for defining an Item in a List component.
 * Can either be a container
 */
export class ListItem extends BaseElementContainer implements IListItem {
    constructor(config?: IListItemConfig) {
        if (config === void 0) { config = {}; }
        super(config);
    }
}

import {BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig} from './BaseElementContainer'

export interface IContentConfig extends IBaseElementContainerConfig {
}

export interface IContent extends IBaseElementContainer {
}

/**
 * Content UX component.
 */
export class Content extends BaseElementContainer implements IContent {
    constructor(config?: IContentConfig) {
        if (config === void 0) { config = {}; }
        super(config);
    }
}
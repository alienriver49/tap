import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './baseElementContainer';

export interface IHeadingConfig extends IBaseElementContainerConfig {
    importance: number;
}

export interface IHeading extends IBaseElementContainer {
    importance: number;
}

/**
 * Heading UX component.
 */
export class Heading extends BaseElementContainer implements IHeading {
    constructor(config: IHeadingConfig) {
        super(config);
        this.importance = config.importance < 1 ? 1 : (config.importance > 6 ? 6 : config.importance);
    }

    public importance: number;
}

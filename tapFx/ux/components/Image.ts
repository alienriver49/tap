import {BaseElement, IBaseElement, IBaseElementConfig} from './BaseElement'

export interface IImageConfig extends IBaseElementConfig {
    src?: string;
}

export interface IImage extends IBaseElement {
    attributeSrc: string;
}

/**
 * Image UX component.
 */
export class Image extends BaseElement implements IImage {
    constructor(config?: IImageConfig) {
        if (config === void 0) { config = {}; }
        super(config);

        this.attributeSrc = config.src || '';
    }

    @BaseElement.tapcAttribute("src")
    attributeSrc: string;
}

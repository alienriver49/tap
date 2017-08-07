import { BaseElement, IBaseElement, IBaseElementConfig } from './baseElement';
import { AttributeMetadata } from './../metadata/attributeMetadata';

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
        if (config === void 0) { 
            config = {}; 
        }
        
        super(config);

        this.attributeSrc = config.src || '';
    }

    @AttributeMetadata.set('src')
    public attributeSrc: string;
}

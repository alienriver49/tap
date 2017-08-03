import { BaseElement, IBaseElement, IBaseElementConfig } from './BaseElement';

export interface ITextConfig extends IBaseElementConfig {
    text?: string;
}

export interface IText extends IBaseElement {
    text: string;
}

/**
 * Text UX component for defining text to be displayed.
 */
export class Text extends BaseElement implements IText {
    constructor(config?: ITextConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        
        super(config);

        this.text = config.text || '';
    }

    public text: string;
}

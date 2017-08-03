import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './BaseElementContainer';
import { BaseElement } from './BaseElement';

export interface ITextAreaConfig extends IBaseElementContainerConfig {
    rows?: string;
    cols?: string;
}

export interface ITextArea extends IBaseElementContainer {
    attributeRows: string;
    attributeCols: string;
}

/**
 * Text area UX component for inputting large amounts of text.
 */
export class TextArea extends BaseElementContainer implements ITextArea {
    constructor(config?: ITextAreaConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeRows = config.rows || '10';
        this.attributeCols = config.cols || '40';
    }

    @BaseElement.tapcAttribute('rows')
    public attributeRows: string;

    @BaseElement.tapcAttribute('cols')
    public attributeCols: string;
}

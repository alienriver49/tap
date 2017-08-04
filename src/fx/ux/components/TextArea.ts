import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './BaseElementContainer';
import { BaseElement } from './BaseElement';
import { AttributeMetadata } from './../metadata/attributeMetadata';

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

    @AttributeMetadata.Set('rows')
    public attributeRows: string;

    @AttributeMetadata.Set('cols')
    public attributeCols: string;
}

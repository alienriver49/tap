import { BaseElement, IBaseElement, IBaseElementConfig } from './baseElement';
import { Text } from './text';
import { SpecialHandlingMetadata } from '../metadata/specialHandlingMetadata';

export interface IBaseElementContainerConfig extends IBaseElementConfig {
    content?: IBaseElement[];
    hasBorder?: boolean;
}

export interface IBaseElementContainer extends IBaseElement {
    content: IBaseElement[];
}

/**
 * Container for UX components. This contains a content array of IBaseElement. This should be used for any "element" which could contain other "elements".
 */
export class BaseElementContainer extends BaseElement implements IBaseElementContainer {
    constructor(config?: IBaseElementContainerConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        
        super(config);
        this.content = config.content || [];
        this.hasBorder = config.hasBorder !== void(0) ? config.hasBorder : false;
    }

    public content: IBaseElement[];
    
    @SpecialHandlingMetadata.set()
    public hasBorder: boolean;

    /**
     * Chainable shortcut for adding text to a container.
     * @param text 
     * @chainable
     */
    public addText(...text: string[]): this {
        text.forEach((t) => {
            this.addToContainer(new Text({text: t}));
        });

        return this;
    }

    /**
     * Chainable method for adding content to a container.
     * @param content 
     * @chainable
     */
    public addToContainer(...content: IBaseElement[]): this {
        this.content.push(...content);

        return this;
    }
}

import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './BaseElementContainer';
import { BaseElement } from './BaseElement';
import { Icon } from './Icon';
import { Text } from './Text';
import { AttributeMetadata } from './../metadata/attributeMetadata';

export interface ILinkConfig extends IBaseElementContainerConfig {
    href?: string;
}

export interface ILink extends IBaseElementContainer {
    attributeHref: string;
}

/**
 * Link UX component.
 */
export class Link extends BaseElementContainer implements ILink {
    constructor(config?: ILinkConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        
        this.attributeHref = config.href || '';
    }

    @AttributeMetadata.Set('href')
    public attributeHref: string;

    /**
     * Add an icon to the button.
     * @param iconName 
     */
    public addIcon(iconName: string): this {
        this.addToContainer(new Icon({ class: iconName }), new Text({text: ' '}));

        return this;
    }
}

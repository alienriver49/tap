import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './baseElementContainer';
import { BaseElement } from './baseElement';
import { Icon } from './icon';
import { Text } from './text';
import { Disableable, IDisabled, IDisabledConfig } from './../attributes/disabled';
import { AttributeMetadata } from './../metadata/attributeMetadata';
import { EventMetadata } from './../metadata/eventMetadata';

export interface IButtonConfig extends IBaseElementContainerConfig, IDisabledConfig {
    type?: /*ButtonType*/string;
    click?: string;
}

// note: TypeScript 2.4 allows string enums
/*export const enum ButtonType {
    Button = 'button',
}*/

export class ButtonType {
    public static readonly BUTTON: string = 'button';
}

export const BUTTON_BASE_CLASS = 'btn';

export class ButtonClass {
    public static readonly DEFAULT: string = 'btn-default';
    public static readonly PRIMARY: string = 'btn-primary';
    public static readonly SECONDARY: string = 'btn-secondary';
    public static readonly SUCCESS: string = 'btn-success';
    public static readonly INFO: string = 'btn-info';
    public static readonly WARNING: string = 'btn-warning';
    public static readonly DANGER: string = 'btn-danger';
    public static readonly LINK: string = 'btn-link';
}

const BUTTON_CLASSES: string[] = Object.keys(ButtonClass).map((s) => ButtonClass[s]);

export interface IButton extends IBaseElementContainer, IDisabled {
    attributeType: string;
    eventClick: string;
}

/**
 * Button UX component.
 */
export class Button extends Disableable(BaseElementContainer) implements IButton {
    constructor(config?: IButtonConfig) {
        if (config === void 0) { 
            config = {}; 
        }

        super(config);
        this.attributeType = config.type || ButtonType.BUTTON;
        this.eventClick = config.click || '';

        // default configuration
        this.addClass(BUTTON_BASE_CLASS);
        // if the button has no class from our class config, give it the default
        const classes = this.attributeClass.split(' ');
        if (classes.filter((c) => BUTTON_CLASSES.indexOf(c) !== -1).length === 0) {
            this.addClass(ButtonClass.DEFAULT);
        }
    }

    @AttributeMetadata.set('type')
    public attributeType: string;

    @EventMetadata.set('click')
    public eventClick: string;

    /**
     * Add an icon to the button.
     * @param iconName 
     */
    public addIcon(iconName: string): this {
        this.addToContainer(new Icon({ class: iconName }), new Text({text: ' '}));

        return this;
    }
}

import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './BaseElementContainer';
import { BaseElement } from './BaseElement';
import { Icon } from './Icon';
import { Text } from './Text';

export interface IButtonConfig extends IBaseElementContainerConfig {
    type?: /*ButtonType*/string;
    disabled?: string;
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

export interface IButton extends IBaseElementContainer {
    attributeType: string;
    attributeDisabled: string;
    eventClick: string;
}

/**
 * Button UX component.
 */
export class Button extends BaseElementContainer implements IButton {
    constructor(config?: IButtonConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeType = config.type || ButtonType.BUTTON;
        this.attributeDisabled = config.disabled || '';
        this.eventClick = config.click || '';

        // default configuration
        this.addClass(BUTTON_BASE_CLASS);
        // if the button has no class from our class config, give it the default
        const classes = this.attributeClass.split(' ');
        if (classes.filter((c) => BUTTON_CLASSES.indexOf(c) !== -1).length === 0) {
            this.addClass(ButtonClass.DEFAULT);
        }
    }

    @BaseElement.tapcAttribute('type')
    public attributeType: string;

    @BaseElement.tapcAttribute('disabled')
    public attributeDisabled: string;

    @BaseElement.tapcEvent('click')
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

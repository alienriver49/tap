import {BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig} from './BaseElementContainer'
import {BaseElement} from './BaseElement'
import {Icon} from './Icon'
import {Text} from './Text'

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
    public static readonly Button: string = 'button';
}

export const ButtonClassBase = 'btn';

export class ButtonClass {
    public static readonly Default: string = 'btn-default';
    public static readonly Primary: string = 'btn-primary';
    public static readonly Secondary: string = 'btn-secondary';
    public static readonly Success: string = 'btn-success';
    public static readonly Info: string = 'btn-info';
    public static readonly Warning: string = 'btn-warning';
    public static readonly Danger: string = 'btn-danger';
    public static readonly Link: string = 'btn-link';
}

const ButtonClasses: string[] = Object.keys(ButtonClass).map((s) => { return ButtonClass[s]; });

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
        this.attributeType = config.type || ButtonType.Button;
        this.attributeDisabled = config.disabled || '';
        this.eventClick = config.click || '';

        // default configuration
        this.addClass(ButtonClassBase);
        // if the button has no class from our class config, give it the default
        let classes = this.attributeClass.split(' ');
        if (classes.filter((c) => { return ButtonClasses.indexOf(c) !== -1 }).length === 0)
            this.addClass(ButtonClass.Default);
    }

    @BaseElement.tapcAttribute("type")
    attributeType: string;
    @BaseElement.tapcAttribute("type")
    attributeDisabled: string;
    @BaseElement.tapcEvent("click")
    eventClick: string;

    /**
     * Add an icon to the button.
     * @param iconName 
     */
    addIcon(iconName: string): this {
        this.addToContainer(new Icon({ class: iconName }), new Text({text: ' '}));

        return this;
    }
}

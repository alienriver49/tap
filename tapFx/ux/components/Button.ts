import {BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig} from './BaseElementContainer'
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

const ButtonStyleBase = 'btn';

class ButtonStyle {
    public static readonly Default: string = 'btn-default';
    public static readonly Primary: string = 'btn-primary';
    public static readonly Secondary: string = 'btn-secondary';
    public static readonly Success: string = 'btn-success';
    public static readonly Info: string = 'btn-info';
    public static readonly Warning: string = 'btn-warning';
    public static readonly Danger: string = 'btn-danger';
    public static readonly Link: string = 'btn-link';
}

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
        this.addClass(ButtonStyleBase);
        // if the button has no style from our style config, give it the default
        let classes = this.attributeClass.split(' ');
        let buttonStyles: string[] = Object.keys(ButtonStyle).map((s) => { return ButtonStyle[s]; });
        if (classes.filter((c) => { return buttonStyles.indexOf(c) !== -1 }).length === 0)
            this.addClass(ButtonStyle.Default);
    }

    attributeType: string;
    attributeDisabled: string;
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

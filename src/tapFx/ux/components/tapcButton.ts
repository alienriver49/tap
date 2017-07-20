import {tapcBaseContainer, ITapcBaseContainerConfig} from './tapcBaseContainer'

export interface ITapcButtonConfig extends ITapcBaseContainerConfig {
    type?: /*ButtonType*/string;
    disabled?: string;
    click?: string;
}

// note: TypeScript 2.4 allows string enums
/*export const enum ButtonType {
    Button = 'button',
}*/

export class ButtonType {
    public static readonly Button: string = "button";
}

export class tapcButton extends tapcBaseContainer {
    constructor(config?: ITapcButtonConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeType = config.type || ButtonType.Button;
        this.attributeDisabled = config.disabled || '';
        this.eventClick = config.click || '';
    }

    attributeType: string;
    attributeDisabled: string;
    eventClick: string;
}

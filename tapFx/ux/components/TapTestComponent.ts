import {BaseElement, IBaseElement, IBaseElementConfig} from './BaseElement'

export interface ITapTestComponentConfig extends IBaseElementConfig {
    clearText?: string;
    display?: string;
    raised?: string;
}

export interface ITapTestComponent extends IBaseElement {
    attributeClearText: string;
    attributeDisplay: string;
    attributeRaised: string;
}

export class TapTestComponent extends BaseElement implements ITapTestComponent {
    constructor(config?: ITapTestComponentConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeClearText = config.clearText || '';
        this.attributeDisplay = config.display || '';
        this.attributeRaised = config.raised || '';
    }

    attributeClearText: string;
    attributeDisplay: string;
    attributeRaised: string;
}

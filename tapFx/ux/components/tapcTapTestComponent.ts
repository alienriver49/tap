import {tapcBase, ITapcBaseConfig} from './tapcBase'

export interface ITapcTapTestComponentConfig extends ITapcBaseConfig {
    clearText?: string;
    display?: string;
    raised?: string;
}

export class tapcTapTestComponent extends tapcBase {
    constructor(config?: ITapcTapTestComponentConfig) {
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

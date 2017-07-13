import {tapcBase, ITapcBase} from './tapcBase'

export interface ITapcTapTestComponent extends ITapcBase {
    clearText?: string;
    display?: string;
    raised?: string;
}

export class tapcTapTestComponent extends tapcBase{

    constructor(config?: ITapcTapTestComponent){
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

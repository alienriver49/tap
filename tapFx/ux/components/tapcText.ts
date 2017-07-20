import {tapcBase, ITapcBase} from './tapcBase'

export interface ITapcText extends ITapcBase {
    text?: string;
}

export class tapcText extends tapcBase{

    constructor(config?: ITapcText){
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeText = config.text || '';
    }

    attributeText: string;
}

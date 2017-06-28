import {tapcBase, ITapcBase} from './tapcBase'

export interface ITapcInput extends ITapcBase {
    type?: string;
    value?: string;
}

export class tapcInput extends tapcBase{

    constructor(config?: ITapcInput){
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeType = config.type || 'text';
        this.attributeValue = config.value || '';
    }

    attributeType: string;
    attributeValue: string;
}

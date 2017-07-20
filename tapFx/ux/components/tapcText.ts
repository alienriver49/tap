import {tapcBase, ITapcBaseConfig} from './tapcBase'

export interface ITapcTextConfig extends ITapcBaseConfig {
    text?: string;
}

export class tapcText extends tapcBase {
    constructor(config?: ITapcTextConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.text = config.text || '';
    }

    text: string;
}

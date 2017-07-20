import {tapcBase, ITapcBase} from './tapcBase'

export interface ITapcBaseContainer extends ITapcBase {
    content?: tapcBase[];
}

export class tapcBaseContainer extends tapcBase{

    constructor(config?: ITapcBaseContainer) {
        if (config === void 0) { config = {}; }
        super(config);
        this.content = config.content || [];
    }

    content: tapcBase[];
}
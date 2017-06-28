export interface ITapcBase {
    id?: string;
    name?: string;
}

export class tapcBase{

    constructor(config?: ITapcBase){
        if (config === void 0) { config = {}; }
        this.attributeId = config.id || '';
        this.attributeName = config.name || '';
    }

    attributeId: string;
    attributeName: string;
}


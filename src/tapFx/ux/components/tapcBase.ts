export interface ITapcBaseConfig {
    id?: string;
    name?: string;
    /* Specific to binding frameworks (i.e. Aurelia's binding engine) */
    if?: string;
    repeat?: string;
}

export class tapcBase {
    constructor(config?: ITapcBaseConfig) {
        if (config === void 0) { config = {}; }
        this.attributeId = config.id || '';
        this.attributeName = config.name || '';
        this.attributeIf = config.if || '';
        this.attributeRepeat = config.repeat || '';
    }

    attributeId: string;
    attributeName: string;
    attributeIf: string;
    attributeRepeat: string;
}


import {tapcBaseContainer, ITapcBaseContainerConfig} from './tapcBaseContainer'

export interface ITapcLabelConfig extends ITapcBaseContainerConfig {
    for?: string;
    value?: string;
}

export class tapcLabel extends tapcBaseContainer {
    constructor(config?: ITapcLabelConfig) {
        super(config);
        if (config && typeof config === 'object') {
            this.attributeFor = config.for || '';
            this.attributeValue = config.value || '';
        }
    }

    attributeFor: string;
    attributeValue: string;
}

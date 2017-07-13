import {tapcBaseContainer, ITapcBaseContainer} from './tapcBaseContainer'

export interface ITapcLabel extends ITapcBaseContainer {
    for?: string;
    value?: string;
}

export class tapcLabel extends tapcBaseContainer{

    constructor(config?: ITapcLabel){
        super(config);
        if (config && typeof config === 'object'){
            this.content = config.content || [];
            this.attributeFor = config.for || '';
            this.attributeValue = config.value || '';
        }
    }

    attributeFor: string;
    attributeValue: string;
}

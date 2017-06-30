import {tapcBaseContainer, ITapcBaseContainer} from './tapcBaseContainer'

export interface ITapcButton extends ITapcBaseContainer {
    type?: string;
    click?: string;
}

export class tapcButton extends tapcBaseContainer{

    constructor(config?: ITapcButton){
        if (config === void 0) { config = {}; }
        super(config);
        this.attributeType = config.type || 'text';
        this.eventClick = config.click || '';
    }

    attributeType: string;
    eventClick: string;
}

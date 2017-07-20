
import {tapcBaseContainer, ITapcBaseContainer} from './tapcBaseContainer'

export interface ITapcDiv extends ITapcBaseContainer {
}

export class tapcDiv extends tapcBaseContainer{

    constructor(config?: ITapcDiv){
        if (config === void 0) { config = {}; }
        super(config);
        this.content = config.content || [];
    }

}

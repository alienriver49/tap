
import {tapcBaseContainer, ITapcBaseContainerConfig} from './tapcBaseContainer'

export interface ITapcHeadingConfig extends ITapcBaseContainerConfig {
    importance: number;
}

export class tapcHeading extends tapcBaseContainer {
    constructor(config: ITapcHeadingConfig) {
        super(config);
        this.importance = config.importance < 1 ? 1 : (config.importance > 6 ? 6 : config.importance);
    }

    public importance: number;
}

import {tapcBaseContainer, ITapcBaseContainerConfig} from './tapcBaseContainer'

export interface ITapcDivConfig extends ITapcBaseContainerConfig {
}

// TODO: this should be renamed to something more generic, like tapcContent or something. we want to avoid HTML-specific names where possible
export class tapcDiv extends tapcBaseContainer {
    constructor(config?: ITapcDivConfig) {
        if (config === void 0) { config = {}; }
        super(config);
    }
}
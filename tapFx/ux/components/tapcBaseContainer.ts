import {tapcBase, ITapcBaseConfig} from './tapcBase'
import {tapcText} from './tapcText'

export interface ITapcBaseContainerConfig extends ITapcBaseConfig {
    content?: tapcBase[];
    //text?: string;
}

export class tapcBaseContainer extends tapcBase {
    constructor(config?: ITapcBaseContainerConfig) {
        if (config === void 0) { config = {}; }
        super(config);
        this.content = config.content || [];
        //if (config.text) this.addText(config.text);
    }

    content: tapcBase[];

    /**
     * Chainable shortcut for adding text to a container.
     * @param text 
     * @chainable
     */
    addText(...text: string[]): this {
        text.forEach((t) => {
            this.addToContainer(new tapcText({text: t}))
        });

        return this;
    }

    /**
     * Chainable method for adding content to a container.
     * @param content 
     * @chainable
     */
    addToContainer(...content: tapcBase[]): this {
        this.content.push(...content);

        return this;
    }
}
import {tapcBaseContainer, ITapcBaseContainerConfig} from './tapcBaseContainer'
import {tapcDiv} from './tapcDiv'
import {tapcLabel, ITapcLabelConfig} from './tapcLabel'
import {tapcInput, ITapcInputConfig} from './tapcInput'

export interface ITapcFormConfig extends ITapcBaseContainerConfig {
    
}

export class tapcForm extends tapcBaseContainer {
    constructor(config?: ITapcFormConfig) {
        if (config === void 0) { config = {}; }
        super(config);
    }

    /**
     * Add a label and input to a form.
     * @param label 
     * @param input 
     * @chainable
     */
    addLabelInput(label: tapcLabel, input: tapcInput): this {
        this.addToContainer(
            new tapcDiv().addToContainer(
                label,
                input
            )
        );

        return this;
    }

    /**
     * Add a label and input to a form.
     * @param labelConfig 
     * @param inputConfig 
     */
    /*addLabelInput(labelConfig: ITapcLabelConfig, inputConfig: ITapcInputConfig): this {
        let label = new tapcLabel(labelConfig);
        let input = new tapcInput(labelConfig);

        this.addToContainer(
            new tapcDiv().addToContainer(
                label,
                input
            )
        );

        return this;
    }*/
}

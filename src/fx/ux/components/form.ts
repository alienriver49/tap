import { BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig } from './baseElementContainer';
import { Content } from './content';
import { Label, ILabel, ILabelConfig } from './label';
import { Input, IInput, IInputConfig } from './input';
import { ITextArea } from './textArea';

export interface IFormConfig extends IBaseElementContainerConfig {
    
}

export interface IForm extends IBaseElementContainer {
    addLabelInput(label: ILabel, input: IInput): this;
}

/**
 * Form input UX component.
 */
export class Form extends BaseElementContainer implements IForm {
    constructor(config?: IFormConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        
        super(config);
    }

    /**
     * Add a label and input to a form.
     * @param label 
     * @param input 
     * @chainable
     */
    public addLabelInput(label: ILabel, input: IInput | ITextArea): this {
        this.addToContainer(
            new Content().addToContainer(
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
    /*addLabelInput(labelConfig: ILabelConfig, inputConfig: IInputConfig): this {
        let label = new Label(labelConfig);
        let input = new Input(labelConfig);

        this.addToContainer(
            new Content().addToContainer(
                label,
                input
            )
        );

        return this;
    }*/
}

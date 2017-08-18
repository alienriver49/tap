import { BaseBlade, IBaseBlade } from './viewModels.baseBlade';
import { Form, IFormConfig } from '../components/form';

export interface IFormBlade extends IBaseBlade {
    addForm(formConfig?: IFormConfig): Form;
}

export class FormBlade extends BaseBlade implements IFormBlade {
    constructor() {
        super();
    }

    /**
     * Add a form to this blade and return a reference to that form.
     * @param formConfig 
     */
    public addForm(formConfig?: IFormConfig): Form {
        const form = new Form(formConfig);

        this.content.push(form);

        return form;
    }
}

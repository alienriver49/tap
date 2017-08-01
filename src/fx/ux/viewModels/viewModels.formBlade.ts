import { tapcForm, ITapcFormConfig } from './../components/tapcForm';
import { BaseBlade } from './viewModels.baseBlade';

export class FormBlade extends BaseBlade {
    constructor() {
        super();
    }

    /**
     * Add a form to this blade and return a reference to that form.
     * @param formConfig 
     */
    public addForm(formConfig?: ITapcFormConfig): tapcForm {
        let form = new tapcForm(formConfig);

        this.content.push(form);

        return form;
    }
}

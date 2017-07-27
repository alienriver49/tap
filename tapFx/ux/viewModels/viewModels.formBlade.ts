import {Form, IFormConfig} from './../components/Form'
import {BaseBlade} from './viewModels.baseBlade'

export class FormBlade extends BaseBlade {
    constructor() {
        super();
    }

    /**
     * Add a form to this blade and return a reference to that form.
     * @param formConfig 
     */
    public addForm(formConfig?: IFormConfig): Form {
        let form = new Form(formConfig);

        this.content.push(form);

        return form;
    }
}

export default FormBlade
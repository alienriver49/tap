import { bindable, customAttribute, inject, DOM } from 'aurelia-framework';
import { View } from 'aurelia-templating';
import '@material/button/dist/mdc.button.css';

@customAttribute('mdc-button')
@inject(Element)
export class MdcButton {
    @bindable() 
    public raised = false;

    constructor(private element: Element) { 
    }

    public created(owningView: View, myView: View) {

    }

    public attached() {
        this.element.classList.add('mdc-button');
    }

    public detached() {
        const classes = [
            'mdc-button',
            'mdc-button--accent',
            'mdc-button--raised'
        ];
        this.element.classList.remove(...classes);
    }

    public raisedChanged(newValue) {
        if (newValue) {
            this.element.classList.add('mdc-button--raised');
        } else {
            this.element.classList.remove('mdc-button--raised');
        }
    }
}

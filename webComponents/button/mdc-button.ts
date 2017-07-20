import {bindable, customAttribute, inject, DOM} from 'aurelia-framework';
import {View} from 'aurelia-templating';
import '@material/button/dist/mdc.button.css';

@customAttribute('mdc-button')
@inject(Element)
export class MdcButton {
    @bindable() raised = false;

    constructor(private element: Element) { 
    }

    created(owningView: View, myView: View){
    }

    attached() {
        this.element.classList.add('mdc-button');
    }

    detached() {
        const classes = [
            'mdc-button',
            'mdc-button--accent',
            'mdc-button--raised'
        ];
        this.element.classList.remove(...classes);
    }

    raisedChanged(newValue) {
        if (newValue) {
            this.element.classList.add('mdc-button--raised');
        } else {
            this.element.classList.remove('mdc-button--raised');
        }
    }
}

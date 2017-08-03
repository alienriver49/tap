import { inject, bindable, bindingMode, DOM } from 'aurelia-framework';
import { MDCCheckbox } from '@material/checkbox/dist/mdc.checkbox.js';
import '@material/checkbox/dist/mdc.checkbox.css';

@inject(Element)
export class MdcCheckbox {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) 
    public isChecked = false;

    @bindable({ defaultBindingMode: bindingMode.twoWay }) 
    public isIndeterminate = false;

    @bindable() 
    public isDisabled = false;
    public mdcCheckbox;

    constructor(private element: Element) { }

    public bind() {
        this.mdcCheckbox = new MDCCheckbox(this.element);
    }

    public handleChange(e: Event) {
        // stop propagation so we're able to fire our own event when data-binding changes checked value
        e.stopPropagation();
    }

    public isCheckedChanged(newValue) {
        this.isIndeterminate = false;
        const event = new CustomEvent('change', { bubbles: true, detail: { value: newValue }});
        this.element.dispatchEvent(event);
    }

    public isDisabledChanged(newValue) {
        this.mdcCheckbox.disabled = !!newValue;
    }

    public isIndeterminateChanged(newValue) {
        this.mdcCheckbox.indeterminate = !!newValue;
    }
}

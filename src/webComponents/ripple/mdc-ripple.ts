import { bindable, customAttribute, inject, DOM } from 'aurelia-framework';
import { MDCRipple } from '@material/ripple/dist/mdc.ripple.js';
import '@material/ripple/dist/mdc.ripple.css';

@customAttribute('mdc-ripple')
@inject(Element)
export class MdcRipple {
    @bindable() 
    public unbounded = false;
    public mdcRipple;

    constructor(private element: Element) { }

    public bind() {
        this.mdcRipple = new MDCRipple(this.element);
    }

    public attached() {
        this.element.classList.add('mdc-ripple-surface');
    }

    public detached() {
        this.mdcRipple.destroy();
    }

    public unboundedChanged(newValue) {
        this.mdcRipple.unbounded = (newValue === true || newValue === 'true');
    }
}

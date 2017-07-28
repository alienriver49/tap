import {inject, bindable, bindingMode, DOM} from 'aurelia-framework';
import './tap-test-component.css';

@inject(Element)
export class TapTestComponent  {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) display: string = '';
    @bindable({ defaultBindingMode: bindingMode.twoWay }) clearText: boolean = false; 
    @bindable() raised: boolean;
    public isDisabled: boolean = false;

    constructor(private element: Element) { 
    }

    public onClearText() {
        this.clearText = true;
    }

    public bind(bindingContext: Object) {
    }

    displayChanged(newValue: string, oldValue: string): void {
        this.isDisabled = !newValue;
    }

}
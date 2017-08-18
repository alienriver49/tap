import { inject, bindable, bindingMode, DOM } from 'aurelia-framework';
import './tap-test-component.css';

@inject(Element)
export class TapTestComponent  {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) 
    public display: string = '';

    @bindable({ defaultBindingMode: bindingMode.twoWay }) 
    public clearText: boolean = false; 

    @bindable() 
    public raised: boolean;
    public isDisabled: boolean = false;

    constructor(private element: Element) { 
    }

    public onClearText() {
        this.clearText = true;
    }

    public bind(bindingContext: object) {
    }

    public displayChanged(newValue: string, oldValue: string): void {
        this.isDisabled = !newValue;
    }

}

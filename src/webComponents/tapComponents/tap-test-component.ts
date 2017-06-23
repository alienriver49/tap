import {inject, bindable, bindingMode, DOM} from 'aurelia-framework';

@inject(Element)
export class TapTestComponent extends window.TapFx.ViewModels.Blade {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) display: string = '';
    @bindable({ defaultBindingMode: bindingMode.twoWay }) clearText: boolean = false; 
    @bindable() raised: boolean; 
    public isDisabled: boolean = false;

    constructor(private element: Element) { 
        super();
    }

    public onClearText(){
        this.clearText = true;
    }

    public bind(bindingContext: Object){
    }

    displayChanged(newValue: string, oldValue: string): void {
        this.isDisabled = !newValue;
    }

}
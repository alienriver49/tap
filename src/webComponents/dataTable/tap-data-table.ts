import {inject, bindable, bindingMode, DOM} from 'aurelia-framework';

export interface ITapDataTableColumnConfig {
    header: string;
}

@inject(Element)
export class TapDataTable{
    @bindable({ defaultBindingMode: bindingMode.twoWay }) headers: ITapDataTableColumnConfig[];
    @bindable({ defaultBindingMode: bindingMode.twoWay }) data: string[][]; 

    constructor(private element: Element){
    }


    public bind(bindingContext: Object){
    }
}
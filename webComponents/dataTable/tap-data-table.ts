import {inject, bindable, bindingMode, DOM, View} from 'aurelia-framework';
import {ButtonClass, ButtonClassBase} from './../../tapFx/ux/components/Button';
import './tap-data-table.css';

// Copied from mun-browse.IColumnConfiguration
export interface ITapDataTableColumnConfiguration {
    identifier?: string;
    isMultiselect?: boolean;
    property?: string;
    header?: string;
    filter?: string;
    headerClass?: string;
    columnClass?: string;
    filterClass?: string;
    headerStyle?: any;
    columnStyle?: any;
    filterStyle?: string;
    canFilter?: boolean;
    canSort?: boolean;
    sortDirection?: string;
    isSorted?: boolean;
    initialSort?: string;
    //filterOptions?: IFilterOption[];
    filterValue?: any;
    filterType?: string;
    filterPlaceholder?: string | { from: string, to: string };
    filterDateFormat?: string;
    tooltip?: string;
    canSelect?: boolean;
    template?: string;
    templateUrl?: string;
    //templateActionFn?: (column: IColumnConfiguration, record: any, params: any) => void;
    isVisible?: boolean;
    isHidable?: boolean;
    isDraggable?: boolean;
}

@inject(Element)
export class TapDataTableCustomElement {
    @bindable({ defaultBindingMode: bindingMode.oneWay }) title: string;
    @bindable({ defaultBindingMode: bindingMode.oneWay }) totalItems: number;
    @bindable({ defaultBindingMode: bindingMode.oneWay }) columnConfiguration: ITapDataTableColumnConfiguration[];
    @bindable({ defaultBindingMode: bindingMode.twoWay }) data: any[];

    buttonClassBase: string = ButtonClassBase;
    buttonClass: ButtonClass = ButtonClass;

    constructor(
        private _element: Element
    ) {
    }

    public created(owningView: View, myView: View) {
        let dmf = myView;
    }

    public attached() {
        let dmf = 'test';
    }

    public bind(bindingContext: Object) {
        let dmf = bindingContext;
    }
}
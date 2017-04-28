import { inject } from 'aurelia-dependency-injection'
import BindingEngine from './../../binding/bindingEngine'
import { Disposable } from "aurelia-framework/dist/aurelia-framework"; // type

interface IBindingInformation {
    property: string
    unsubscribe: Disposable;
}

interface IViewModelBindings {
    viewModel: Object,
    bindings: IBindingInformation[]
}

@inject(BindingEngine)
class Extension {
    constructor(private _bindingEngine: BindingEngine) { }

    private _vmBindings: IViewModelBindings[] = [];

    registerViewModelBindings(vm: Object) {
        let bindings: IBindingInformation[] = [];

        for (let prop in vm) {
            // anything starting with an underscore is treated as a private property and is not watched for changes
            if (prop.charAt(0) !== '_' && vm.hasOwnProperty(prop)) {
                let unsubscribe = this._bindingEngine
                    .propertyObserver(vm, prop)
                    .subscribe((newValue, oldValue) => {
                        console.log('OMG....blade title has changed.... from:', oldValue, ' to:', newValue);
                    });

                // store binding information
                bindings.push({
                    property: prop,
                    unsubscribe: unsubscribe
                });
            }
        }

        // store all bindings informations for that view model
        if (bindings.length) {
            this._vmBindings.push({
                viewModel: vm,
                bindings: bindings
            });
        }
    }
}

export default Extension;
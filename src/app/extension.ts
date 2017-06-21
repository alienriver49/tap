import { inject} from 'aurelia-framework'
import BindingEngine from './../tapFx/binding/bindingEngine'
import DeferredPromise from './deferredPromise'
import Blade from './../tapFx/ux/viewModels/viewModels.blade'

@inject(BindingEngine)
class Extension {
    constructor(
        private _bindingEngine: BindingEngine,
        public id: string,
        public name: string
    ) { 
        
    }

    blades: Blade[] = [];

    private _registerBladeBindings(bladeID: string, blade: Blade): void {
        this._bindingEngine.resolveId(blade, bladeID);

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
                prop.charAt(0) !== '_' &&
                window.TapFx.Utilities.classOf(blade[prop]) !== '[object Function]'
            ) {
                this._bindingEngine.observe(blade, prop, this.id);
            }
        }
    }

    private _unregisterBladeBindings(blade: Blade): void {
        this._bindingEngine.unobserve(blade);
    }

    private _unregisterAllBladeBindings(): void {
        this._bindingEngine.unobserveAll();
    }

    private _registerBladeFunctions(bladeID: string, blade: Blade, functions: string[]) {
        console.log('[SHELL] Attaching blade functions: ', functions);
        // loop through all the passed functions and add them as a function to the serialized blade which will publish a message with the function data
        for (let func of functions) {
            var extId = this.id;
            blade[func] = function() {
                // publish the function call to the extension
                console.log('[SHELL] Publishing message from function: ' + func);
                window.TapFx.Rpc.publish('tapfx.' + bladeID + '.' + func, extId, { functionArgs: [...arguments] });
                
                // set up a subscription for any result from the calling of the function in the extension
                let resultPromise = new DeferredPromise();
                let subscription = window.TapFx.Rpc.subscribe('shell.' + bladeID + '.' + func, (data) => {
                    console.log('[SHELL] Receiving result from function: ' + func + ' result: ', data);
                    resultPromise.resolve(data);

                    // unsubscribe from the result subscription
                    subscription.unsubscribe();
                });

                return resultPromise.promise.then((result) => { return result; });
            };
        };
    }

    /**
     * Add a blade to an extension.
     * @param bladeID 
     * @param serializedBlade 
     * @param viewName 
     * @param functions 
     */
    addBlade(bladeID: string, serializedBlade: Object, viewName: string, functions: string[]): Blade {
        let blade = new window.TapFx.ViewModels.Blade();
        Object.assign(blade, serializedBlade);
        this._registerBladeBindings(bladeID, blade);
        this._registerBladeFunctions(bladeID, blade, functions);
        this.blades.push(blade);
        
        return blade;
    }

    /**
     * Remove a blade and it's binding from an extension.
     * @param blade 
     */
    removeBlade(blade: Blade): void {
        let index = this.blades.indexOf(blade);
        if (index !== -1) {
            this._unregisterBladeBindings(blade);
            this.blades.splice(index, 1);
        }
    }

    /**
     * Remove all blades.
     */
    removeBlades(): void {
        this._unregisterAllBladeBindings();
        this.blades.splice(0, this.blades.length);
    }
}

export default Extension
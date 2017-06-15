import { inject} from 'aurelia-framework'
import BindingEngine from './../tapFx/binding/bindingEngine'
import ExtensionLoaderEngine from './extensionLoaderEngine'

@inject(BindingEngine, ExtensionLoaderEngine)
class Extension {
    constructor(
        private _bindingEngine: BindingEngine,
        private _extensionLoaderEngine: ExtensionLoaderEngine,
        public id: string,
        public name: string
    ) { 
        
    }

    blades: Object[] = [];

    private _registerBladeBindings(bladeID: string, blade: Object): void {
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

    private _unregisterBladeBindings(blade: Object): void {
        this._bindingEngine.unobserve(blade);
    }

    private _unregisterAllBladeBindings(): void {
        this._bindingEngine.unobserveAll();
    }

    private _registerBladeFunctions(blade: Object, functions: string[]) {
        console.log('[SHELL] Attaching blade functions: ', functions);
        // loop through all the passed functions and add them as a function to the serialized blade which will publish a message with the function data
        for (let func of functions) blade[func] = (...data) => {
            console.log('[SHELL] Publishing message from function: ' + func);
            window.TapFx.Rpc.publish('tapfx.' + func, this.id, { functionData: data });
        };
    }

    addBlade(bladeID: string, serializedBlade: Object, viewName: string, functions: string[]): void {
        let blade = new window.TapFx.ViewModels.Blade();
        Object.assign(blade, serializedBlade);
        this._registerBladeBindings(bladeID, blade);
        this._registerBladeFunctions(blade, functions);
        this.blades.push(blade);
        // Load the view with the passed name
        this._extensionLoaderEngine.addView(this, viewName, blade, functions);
        // Deserialize the view with aurelia and bind it to the blade (viewmodel)
        //this.addView2(serializedView, blade);
    }

    /**
     * Remove a blade and it's binding from an extension.
     * @param blade 
     */
    removeBlade(blade: Object): void {
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
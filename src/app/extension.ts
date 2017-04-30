import { inject } from 'aurelia-framework'
import BindingEngine from './../tapFx/binding/bindingEngine'

@inject(BindingEngine)
class Extension {
    constructor(
        private _bindingEngine: BindingEngine,
        public id: string
    ) { }

    blades: Object[] = [];

    private _registerBladeBindings(bladeID: string, blade: Object): void {
        this._bindingEngine.resolveId(blade, bladeID);

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
                prop.charAt(0) !== '_' &&
                ({}).toString.call(blade[prop] !== '[object Function]')
            ) {
                this._bindingEngine.observe(blade, prop);
            }
        }
    }

    addBlade(bladeID: string, serializedBlade: Object): void {
        let blade = new window.TapFx.ViewModels.Blade();
        Object.assign(blade, serializedBlade);
        this._registerBladeBindings(bladeID, blade);
        this.blades.push(blade);
    }
}

export default Extension
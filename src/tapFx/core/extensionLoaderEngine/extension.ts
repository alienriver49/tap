import { inject } from 'aurelia-dependency-injection'
import BindingEngine from './../../binding/bindingEngine'

@inject(BindingEngine)
class Extension {
    constructor(private _bindingEngine: BindingEngine) { }

    registerBladeBindings(blade: Object): void {
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

    serializeBlade(blade: Object): { [property: string]: any } {
        let serializedBlade = {};

        for (let prop in blade) {
            if (blade.hasOwnProperty(prop) &&
                prop.charAt(0) !== '_' &&
                ({}).toString.call(blade[prop] !== '[object Function]')
            ) {
                serializedBlade[prop] = blade[prop];
            }
        }

        return serializedBlade;
    }
}

export default Extension;
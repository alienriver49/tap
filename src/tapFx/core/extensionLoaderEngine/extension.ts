import { inject } from 'aurelia-dependency-injection'
import Utilities from './../../utilities/utilities'
import BindingEngine from './../../binding/bindingEngine'

@inject(Utilities, BindingEngine)
class Extension {
    constructor(
        private _utilities: Utilities,
        private _bindingEngine: BindingEngine
    ) { }

    private _bladeIDs: string[] = [];

    registerBladeBindings(blade: Object): any {
        let serializedBlade = {};

        let bladeID = this._utilities.newGuid();
        this._bindingEngine.resolveId(blade, bladeID);

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
                prop.charAt(0) !== '_' &&
                this._utilities.classOf(blade[prop]) !== '[object Function]'
            ) {
                this._bindingEngine.observe(blade, prop);
                serializedBlade[prop] = blade[prop];
            }
        }

        return {
            bladeId: bladeID,
            serializedBlade: serializedBlade
        }
    }
}

export default Extension;
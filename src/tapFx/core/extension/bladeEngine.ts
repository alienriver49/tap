import BaseBlade from './../../ux/viewModels/viewModels.baseBlade' // type only

class BladeEngine {
    constructor() {

    }

    /**
     * Check whether a blade can be activated and perform any activation logic.
     * @param blade 
     * @returns Whether the blade can be activated.
     */
    public canActivate(blade: BaseBlade): Promise<boolean> {
        // if there is no canActivate method we return true, otherwise we will return the result of blade.canActivate()
        let canActivate = (!blade.canActivate) || (blade.canActivate && blade.canActivate());

        let activateChain = Promise.resolve<boolean>(canActivate);
        activateChain = activateChain.then((result) => {
            // result is the value from canActivate or the return value from the canActivate() promise
            let ret: boolean | Promise<boolean> = result;
            if (result) {
                // if we canActivate, call the activate function if it exists and have it return our result
                let activate = blade.activate ? blade.activate() : undefined;
                if (activate) ret = activate.then(() => { return result; });
            }
            
            return ret;
        });

        return activateChain;
    }

    /**
     * Check whether a blade can be deactivated and perform any deactivation logic.
     * @param blade 
     * @returns Whether the blade can be deactivated.
     */
    public canDeactivate(blade: BaseBlade): Promise<boolean> {
        // if there is no canDeactivate method we return true, otherwise we will return the result of blade.canDeactivate()
        let canDeactivate = (!blade.canDeactivate) || (blade.canDeactivate && blade.canDeactivate());

        // start a deactivation chain which resolves to the canDeactivate result
        let deactivateChain = Promise.resolve<boolean>(canDeactivate);
        deactivateChain = deactivateChain.then((result) => {
            // result is the value from canDeactivate or the return value from the canDeactivate() promise
            let ret: boolean | Promise<boolean> = result;
            if (result) {
                // if we canDeactivate, call the deactivate function if it exists and have it return our result
                let deactivate = blade.deactivate ? blade.deactivate() : undefined;
                if (deactivate) ret = deactivate.then(() => { return result; });
            }
            
            return ret;
        });

        return deactivateChain;
    }
}

export default BladeEngine
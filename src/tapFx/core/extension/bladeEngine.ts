import BaseBlade from './../../ux/viewModels/viewModels.baseBlade' // type only

class BladeEngine {
    constructor() {

    }

    /**
     * Check whether a blade can be activated and perform any activation logic.
     * @param blade 
     * @returns Promise resolving to whether the blade can be activated.
     */
    public performActivation(blade: BaseBlade): Promise<boolean> {
        let promiseChain = Promise.resolve<boolean>(this.canActivate(blade));
        promiseChain = promiseChain.then((result) => {
            let ret: boolean | Promise<boolean> = result;
            if (result) {
                // if we canActivate, call the activate function if it exists and have it return our result
                this.activate(blade).then(() => { return result; });
            }
            
            return ret;
        });

        return promiseChain;
    }

    /**
     * Check whether a blade can be activated.
     * @param blade 
     * @returns Promise resolving to whether the blade can be activated.
     */
    public canActivate(blade: BaseBlade): Promise<boolean> {
        // result is the value from canActivate or the return value from the canActivate() promise
        let canActivate = (!blade.canActivate) || (blade.canActivate && blade.canActivate());
        return Promise.resolve<boolean>(canActivate);
    }

    /**
     * Perform blade activation logic.
     * @param blade 
     * @returns Promise resolving to void (undefined).
     */
    public activate(blade: BaseBlade): Promise<void> {
        let activate = blade.activate ? blade.activate() : undefined;
        return Promise.resolve<void>(activate);
    }

    /**
     * Check whether a blade can be deactivated and perform any deactivation logic.
     * @param blade 
     * @returns Promise resolving to whether the blade can be deactivated.
     */
    public performDeactivation(blade: BaseBlade): Promise<boolean> {
        let promiseChain = Promise.resolve<boolean>(this.canDeactivate(blade));
        promiseChain = promiseChain.then((result) => {
            let ret: boolean | Promise<boolean> = result;
            if (result) {
                // if we canDectivate, call the deactivate function if it exists and have it return our result
                this.deactivate(blade).then(() => { return result; });
            }
            
            return ret;
        });

        return promiseChain;
    }

    /**
     * Check whether a blade can be deactivated.
     * @param blade 
     * @returns Promise resolving to whether the blade can be deactivated.
     */
    public canDeactivate(blade: BaseBlade): Promise<boolean> {
        // result is the value from canDeactivate or the return value from the canDeactivate() promise
        let canDeactivate = (!blade.canDeactivate) || (blade.canDeactivate && blade.canDeactivate());
        return Promise.resolve<boolean>(canDeactivate);
    }

    /**
     * Perform blade deactivation logic.
     * @param blade 
     * @returns Promise resolving to void (undefined).
     */
    public deactivate(blade: BaseBlade): Promise<void> {
        let deactivate = blade.deactivate ? blade.deactivate() : undefined;
        return Promise.resolve<void>(deactivate);
    }
}

export default BladeEngine
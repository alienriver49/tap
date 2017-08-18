import { BaseBlade } from '../../ux/view-models/viewModels.baseBlade'; // type only

export class BladeEngine {
    constructor() {}

    /**
     * Check whether a blade can be activated and perform any activation logic.
     * @param blade 
     * @returns Promise resolving to whether the blade can be activated.
     */
    public performActivation(blade: BaseBlade): Promise<boolean> {
        let promiseChain = Promise.resolve<boolean>(this.canActivate(blade));
        promiseChain = promiseChain.then((result) => {
            const ret: boolean | Promise<boolean> = result;
            if (result) {
                // if we canActivate, call the activate function if it exists and have it return our result
                this.activate(blade).then(() => { 
                    return result; 
                });
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
        const canActivate = (!blade.canActivate) || (blade.canActivate && blade.canActivate());
        return Promise.resolve<boolean>(canActivate);
    }

    /**
     * Perform blade activation logic.
     * @param blade 
     * @returns Promise resolving to void (undefined).
     */
    public activate(blade: BaseBlade): Promise<void> {
        const activate = blade.activate ? blade.activate() : undefined;
        return Promise.resolve<void>(activate);
    }

    /**
     * Check whether a blade can be deactivated and perform any deactivation logic.
     * @param blade 
     * @param checkCanDeactivate Whether we should check canDeactivate. Defaults to true. If false, this will just call deactivate.
     * @returns Promise resolving to whether the blade can be deactivated (if checkCanDeactivate is false, this will resolve true).
     */
    public performDeactivation(blade: BaseBlade, checkCanDeactivate: boolean = true): Promise<boolean> {
        const canDeactivate = checkCanDeactivate ? this.canDeactivate(blade) : true;
        let promiseChain = Promise.resolve<boolean>(canDeactivate);
        promiseChain = promiseChain.then((result) => {
            const ret: boolean | Promise<boolean> = result;
            if (result) {
                // if we canDectivate, call the deactivate function if it exists and have it return our result
                this.deactivate(blade).then(() => { 
                    return result; 
                });
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
        const canDeactivate = (!blade.canDeactivate) || (blade.canDeactivate && blade.canDeactivate());
        return Promise.resolve<boolean>(canDeactivate);
    }

    /**
     * Perform blade deactivation logic.
     * @param blade 
     * @returns Promise resolving to void (undefined).
     */
    public deactivate(blade: BaseBlade): Promise<void> {
        const deactivate = blade.deactivate ? blade.deactivate() : undefined;
        return Promise.resolve<void>(deactivate);
    }
}

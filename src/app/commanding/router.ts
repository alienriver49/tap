import { inject } from 'aurelia-framework'
import { History } from 'aurelia-history'
import CommandManager from './commandManager'

@inject(History, CommandManager)
class Router {
    constructor(
        public history: History,
        public commandManager: CommandManager
    ) {
    }

    /**
     * Flag for if the router active.
     */
    isActive: boolean = false;
    private _prevUrlFragment: string = '/';
    private _currUrlFragment: string = '/';

    /**
     * Activate the router.
     */
    activate(): void {
        if (this.isActive) {
            return;
        }
        
        console.log('[SHELL] Activate router.');
        this.isActive = true;
        this.history.activate({routeHandler: this.loadUrl.bind(this)});
        this.history.setTitle('Titanium Application Portal');
    }

    /**
     * Deactivate the router.
     */
    deactivate(): void {
        this.isActive = false;
        this.history.deactivate();
    }

    /**
     * Handle a route change.
     * @param fragment Standard for aurelia-history; "/" followed by the route information. i.e. "/ext1" would be an example for the URL "/#ext1"
     * @returns {boolean} Success of the route change.
     */
    loadUrl(fragment: string): boolean {
        this._prevUrlFragment = this._currUrlFragment;
        this._currUrlFragment = fragment;
        
        this.commandManager.handleRouteChange(this._prevUrlFragment, this._currUrlFragment);

        return true;
    }
}

export default Router;
import { inject } from 'aurelia-framework'
import { History } from 'aurelia-history'
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import CommandManager from './commandManager'

interface IRouterReroute {
    urlFragment: string;
}

@inject(History, EventAggregator, CommandManager)
class Router {
    constructor(
        private _history: History,
        private _eventAggregator: EventAggregator,
        private _commandManager: CommandManager
    ) {
    }

    /**
     * Rerouting subscription which allows other parts of the shell to reroute.
     */
    private _rerouteSubscription: Subscription;

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
        this._history.activate({routeHandler: this._loadUrl.bind(this)});
        this._history.setTitle('Titanium Application Portal');

        this._rerouteSubscription = this._eventAggregator.subscribe('shell.router.reroute', (response: IRouterReroute) => {
            console.log('[SHELL] Router rerouting to url fragment: ' + response.urlFragment);
            // overwrite these for now
            this._prevUrlFragment = this._currUrlFragment = response.urlFragment;
            // navigate to the urlFragment and don't trigger the routeHandler (which would trigger our _loadUrl function)
            this._history.navigate(response.urlFragment, { trigger: false });
        });
    }

    /**
     * Deactivate the router.
     */
    deactivate(): void {
        this.isActive = false;
        this._history.deactivate();
        this._rerouteSubscription.dispose();
    }

    /**
     * Handle a route change.
     * @param fragment Standard for aurelia-history; "/" followed by the route information. i.e. "/ext1" would be an example for the URL "/#ext1"
     * @returns {boolean} Success of the route change.
     */
    private _loadUrl(fragment: string): boolean {
        this._prevUrlFragment = this._currUrlFragment;
        this._currUrlFragment = fragment;
        
        this._commandManager.handleRouteChange(this._prevUrlFragment, this._currUrlFragment);

        return true;
    }
}

export default Router;
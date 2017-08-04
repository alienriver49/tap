import { inject } from 'aurelia-framework';
import { History } from 'aurelia-history';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

import { CommandManager } from './commandManager';

interface IRouterReroute {
    urlFragment: string;
}

@inject(History, EventAggregator, CommandManager)
export class Router {
    constructor(
        private _history: History,
        private _eventAggregator: EventAggregator,
        private _commandManager: CommandManager
    ) {
        this._reset();
    }

    /**
     * Root url fragment.
     */
    private _rootUrlFragment = '/';

    /**
     * Flag for if the router active.
     */
    public isActive: boolean;

    /**
     * Get the current url.
     */
    public get currentUrl(): string {
        return this._currUrlFragment;
    }

    /**
     * Previous url fragment.
     */
    private _prevUrlFragment: string;
    /**
     * Current url fragment.
     */
    private _currUrlFragment: string;

    /**
     * Subscriptions which the router is subscribed to.
     */
    private _subscriptions: Subscription[];

    /**
     * Activate the router.
     */
    public activate(): void {
        if (this.isActive) {
            return;
        }
        
        console.log('[SHELL] Activate router.');
        this.isActive = true;
        this._history.activate({routeHandler: this._loadUrl.bind(this)});
        this._history.setTitle('Titanium Application Portal');

        // create a reroute subscription
        const subscription = this._eventAggregator.subscribe('shell.router.reroute', (response: IRouterReroute) => {
            console.log('[SHELL] Router rerouting to url fragment: ' + response.urlFragment);
            // overwrite these to the root since we want to reroute from root
            this._prevUrlFragment = this._currUrlFragment = this._rootUrlFragment;
            // navigate to the urlFragment and don't trigger the routeHandler by default (which would trigger our _loadUrl function)
            const triggerRouter = false;
            this._history.navigate(response.urlFragment, { trigger: triggerRouter });
        });
        this._subscriptions.push(subscription);
    }

    /**
     * Deactivate the router.
     */
    public deactivate(): void {
        this._reset();

        this._history.deactivate();
        this._subscriptions.forEach(subscription => subscription.dispose());
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

    /**
     * Reset the router variables.
     */
    private _reset(): void {
        this.isActive = false;
        this._prevUrlFragment = this._currUrlFragment = this._rootUrlFragment;
        this._subscriptions = [];
    }
}

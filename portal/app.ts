import { inject } from 'aurelia-framework';
import { FetchConfig } from 'aurelia-auth';
import Router from './commanding/router';
import ExtensionManager from './extensionManagement/extensionManager'; // imported and injected for use on the view
import './app.css';
import './../tapFx/ux/cssModules';

@inject(FetchConfig, Router, ExtensionManager)
export class App {
    constructor(
        public fetchConfig: FetchConfig,
        public router: Router,
        public extensionManager: ExtensionManager
    ) {
    }

    /**
     * Called when the app view is activated.
     */
    activate() {
        console.log('[SHELL] App activate');
        this.fetchConfig.configure();
    }

    /**
     * Called by the extension iframes custom element.
     */
    extensionIframesReady() {
        console.log('[SHELL] App activateRouter');
        this.router.activate();
    }
}
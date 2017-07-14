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
        // Add a listener for when the page finishes loading to activate our router. Similar to how the router-view and configureRouter work with the aurelia-router.
        // Currently done this way because of the adding of iframes to the extension-iframes div, we must have that div before loading extensions.
        window.onload = () => {
            console.log('[SHELL] Window onload triggered.')
            this.router.activate();
        }
    } 

    activate() {
        this.fetchConfig.configure();
    }
}
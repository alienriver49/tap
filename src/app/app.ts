import { inject } from 'aurelia-framework'
import Router from './router'
import extension from './extension'
import ExtensionManager from './extensionManager' // imported and injected for use on the view

@inject(Router, ExtensionManager)
export class App {
    constructor(
        public router: Router,
        public extensionManager: ExtensionManager
    ) {
        // Temporary, add a listener for when the page finishes loading to activate our router. Similar to how the router-view and configureRouter work with the aurelia-router.
        // Currently done this way because of the adding of iframes to the extension-iframes div, we must have that div before loading extensions.
        window.onload = () => {
            console.log('[SHELL] Window onload triggered.')
            this.router.activate();
        }
    }

    bind(appBindingContext: Object, appOverrideContext: Object) {
        extension.bindingContext = appBindingContext;
        extension.overrideContext = appOverrideContext;
    }    
}
import {inject} from 'aurelia-dependency-injection';
import {customElement} from 'aurelia-templating';
import {DOM} from 'aurelia-pal';

@customElement('extension-iframes')
@inject(DOM.Element)
export class ExtensionIframes {
    constructor(
        private _element: Element,
    ) {
    }

    /**
     * Called when bound to the view. Used by App.
     * @param bindingContext 
     */
    bind(bindingContext: any) {
        if ('extensionIframesReady' in bindingContext) {
            bindingContext.extensionIframesReady();
        }
    }
}
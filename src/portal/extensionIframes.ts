import { inject } from 'aurelia-dependency-injection';
import { customElement } from 'aurelia-templating';

@customElement('extension-iframes')
@inject(Element)
export class ExtensionIframes {
    private _bindingContext;

    constructor(
        private _element: Element,
    ) {
    }

    /**
     * Called when bound to the view.
     * @param bindingContext 
     */
    public bind(bindingContext: any) {
        this._bindingContext = bindingContext;
        
    }

    /**
     * Called when attached to the view.
     */
    public attached() {
        // if the parent view model (binding context) has an extensionIframesReady function, call it. used by App
        if ('extensionIframesReady' in this._bindingContext) {
            this._bindingContext.extensionIframesReady();
        }
    }
}

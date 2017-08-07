import { inject } from 'aurelia-dependency-injection';
import { Utilities } from '../utilities/utilities';

/**
 * Engine for processing TAP conventions.
 */
@inject(Utilities)
export class ConventionEngine {
    constructor(
        private _utilities: Utilities
    ) {
        
    }

    // disabled conventions
    public disabledRegex: RegExp = /([A-Za-z0-9]*)Disabled/;
    public disabledAttribute = 'disabled';
    public disabledBindAttribute = 'disabled.bind';

    // click conventions
    public onClickRegex: RegExp = /on([A-Za-z0-9]*)Click/;
    public onClickAttribute = 'click.delegate';
    public onClickTriggerAttribute = 'click.trigger';

    /**
     * Attach TAP conventions to an HTML object which implements NodeSelector.
     * @param nodeSelector 
     * @param context 
     * @param functions 
     */
    public attachConventions(nodeSelector: NodeSelector, context: object, functions: string[]) {
        this.attachDisabled(nodeSelector, context);
        this.attachClickHandlers(nodeSelector, functions);
    }
    
    /**
     * Attach disabled conventions to an HTML object which implements NodeSelector.
     * @param nodeSelector 
     * @param context 
     */
    public attachDisabled(nodeSelector: NodeSelector, context: object): void {
        console.log('[TAP-FX] Attaching disabled properties via convention');
        for (const prop in context) {
            // only check observable properties for convention
            if (this._utilities.canObserveContextProperty(context, prop)) {
                this._attachDisabled(nodeSelector, prop);
            }
        }
    }

    private _attachDisabled(nodeSelector: NodeSelector, prop: string): void {
        // let's check if this propert matches our disabled regex convention
        console.log('[TAP-FX] Checking property ' + prop + ' against TAP disabled convention');
        const result = this.disabledRegex.exec(prop);
        // if result is set and there is a substring match
        if (result && result[1]) {
            // grab the result name and format it to our convention, i.e. Convention becomes convention, ClickMe becomes clickMe 
            const resultName = result[1];
            const name = this._utilities.lowerCaseFirstChar(resultName);
            // query the document fragment for the convention name
            const element = nodeSelector.querySelector('[name="' + name + '"]');
            // if there is an element and the disabled or disabled.bind attribute hasn't been set yet
            if (element && !element.attributes[this.disabledAttribute] && !element.attributes[this.disabledBindAttribute]) {
                console.log('[TAP-FX] Attaching attribute ' + this.disabledBindAttribute + ' with prop ' + prop + ' to element ' + name);
                // use our master document to create an attribute of this.disabledBindAttribute
                const attribute = document.createAttribute(this.disabledBindAttribute);
                // set the value of that attribute to be our property
                attribute.value = prop;
                // attach, woohoo!
                element.attributes.setNamedItem(attribute);
            }
        }
    }

    /**
     * Attach click handlers to an HTML object which implements NodeSelector. This will attach functions to elements based on convention.
     * @param nodeSelector 
     * @param functions 
     */
    public attachClickHandlers(nodeSelector: NodeSelector, functions: string[]): void {
        console.log('[TAP-FX] Attaching click functions via convention');
        for (const func of functions) {
            this._attachClickHandler(nodeSelector, func);
        }
    }
    
    private _attachClickHandler(nodeSelector: NodeSelector, func: string): void {
        // let's check if this function matches our click regex convention
        console.log('[TAP-FX] Checking function ' + func + ' against TAP click convention');
        const result = this.onClickRegex.exec(func);
        // if result is set and there is a substring match
        if (result && result[1]) {
            // grab the result name and format it to our convention, i.e. Convention becomes convention, ClickMe becomes clickMe 
            const resultName = result[1];
            const name = this._utilities.lowerCaseFirstChar(resultName);
            // query the document fragment for the convention name
            const element = nodeSelector.querySelector('[name="' + name + '"]');
            // if there is an element and the click attribute hasn't been set yet
            if (element && !element.attributes[this.onClickAttribute]) {
                console.log('[TAP-FX] Attaching attribute ' + this.onClickAttribute + ' with function ' + func + ' to element ' + name);
                // use our master document to create an attribute of this.onClickAttribute
                const attribute = document.createAttribute(element.attributes[this.disabledAttribute] ? this.onClickTriggerAttribute : this.onClickAttribute);
                // set the value of that attribute to be a call to our function
                attribute.value = func + '()';
                // attach, woohoo!
                element.attributes.setNamedItem(attribute);
            }
        }
    }
}

import { inject } from 'aurelia-dependency-injection';
import { Utilities } from './../utilities/utilities';

/**
 * Engine for processing TAP conventions.
 */
@inject(Utilities)
export class ConventionEngine {
    constructor(
        private _utilities: Utilities
    ) {
        
    }

    public onClickRegex: RegExp = /onButton([A-Za-z0-9]*)Click/; // note: not currently pulling out the element type so 'onButton' may just become 'on'. if we do want to pull out the element type we may have to change our convention
    public onClickAttribute = 'click.delegate'; // note: we may want to add a check for an isDisabledAttribute ('disabled.bind' for Aurelia) and if present use 'click.trigger' instead. See http://aurelia.io/hub.html#/doc/article/aurelia/binding/latest/binding-delegate-vs-trigger/1 or https://stackoverflow.com/questions/33904248/aurelia-delegate-vs-trigger-how-do-you-know-when-to-use-delegate-or-trigger
    
    /**
     * Attach click handlers to an HTML object which implements NodeSelector. This will attach functions to elements based on convention.
     * @param nodeSelector 
     * @param functions 
     */
    public attachClickHandlers(nodeSelector: NodeSelector, functions: string[]): void {
        console.log('[SHELL] Attaching functions via convention');
        for (const func of functions) {
            // let's check if this function matches our click regex convention
            console.log('[SHELL] Checking function ' + func + ' against TAP click convention');
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
                    console.log('[SHELL] Attaching attribute ' + this.onClickAttribute + ' with function ' + func + ' to element ' + name);
                    // use our master document to create an attribute of this.onClickAttribute
                    const attribute = document.createAttribute(this.onClickAttribute);
                    // set the value of that attribute to be a call to our function
                    attribute.value = func + '()';
                    // attach, woohoo!
                    element.attributes.setNamedItem(attribute);
                }
            }
            
        }
    }
}

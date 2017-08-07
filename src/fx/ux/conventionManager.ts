import { inject } from 'aurelia-dependency-injection';
import { IBaseElement } from './components/baseElement';
import Utilities from './../utilities/utilities';

interface IElementConvention {
    elementType: IBaseElement;
    conventionType: IConvention;
}

class ElementConvention implements IElementConvention {
    public elementType: IBaseElement;
    public conventionType: IConvention;
}

interface IConvention {
    regex: RegExp;
    attribute: string;
}

class Convention implements IConvention {
    constructor(
        _regex: RegExp,
        _attribute: string
    ) {
        this.regex = _regex;
        this.attribute = _attribute;
    }

    public regex: RegExp;
    public attribute: string;
}

/**
 * Class for managing TAP conventions.
 */
@inject(Utilities)
export class ConventionManager {
    constructor(
        private _utilities: Utilities
    ) {
        this._conventions.push(new Convention(/([A-Za-z0-9]*)Disabled/, 'disabled'));
        
    }

    private _conventions: IConvention[];
    private _elementConventions: IElementConvention[];
    
}
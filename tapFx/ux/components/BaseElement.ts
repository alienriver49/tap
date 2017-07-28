/**
 * Config interface for BaseElement creation.
 */
export interface IBaseElementConfig {
    id?: string;
    name?: string;
    class?: string;
    /* Enhanced attributes from binding frameworks (i.e. Aurelia's binding engine) */
    if?: string;
    show?: string;
    hide?: string;
    repeat?: string;
}

export interface IBaseElement {
    attributeId: string;
    attributeName: string;
    attributeClass: string;
    /* Enhanced attributes from binding frameworks (i.e. Aurelia's binding engine) */
    attributeIf: string;
    attributeShow: string;
    attributeHide: string;
    attributeRepeat: string;
}

/**
 * Base element of UX components.
 */
export class BaseElement implements IBaseElement {
    constructor(config?: IBaseElementConfig) {
        if (config === void 0) { config = {}; }
        this.attributeId = config.id || '';
        this.attributeName = config.name || '';
        this.attributeClass = config.class || '';
        this.attributeIf = config.if || '';
        this.attributeShow = config.show || '';
        this.attributeHide = config.hide || '';
        this.attributeRepeat = config.repeat || '';
    }

    attributeId: string;
    attributeName: string;
    attributeClass: string; // TODO: I think that we might want this to be a getter which joins a string array of classes
    /* Enhanced attributes from binding frameworks (i.e. Aurelia's binding engine) */
    attributeIf: string;
    attributeShow: string;
    attributeHide: string;
    attributeRepeat: string;

    private get _classes(): string[] {
        return this.attributeClass.split(' ');
    }

    /**
     * Add a style class to the element.
     * @param className 
     */
    addClass(className: string): this {
        if (this._classes.length === 0 || this._classes.indexOf(className) === -1) {
            this.attributeClass = className + ' ' + this.attributeClass;
        }

        return this;
    }
}


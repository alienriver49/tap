/**
 * Using the reflect-metadata library which adds a polyfill for an experimental metadata API. 
 * This library is not yet part of the ECMAScript (JavaScript) standard. However, once 
 * decorators are officially adopted as part of the ECMAScript standard these extensions 
 * will be proposed for adoption.
 * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
import 'reflect-metadata';

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
    // Functions to check for decorator metadata
    getEventName(propertyName: string): string | undefined;
    getAttributeName(propertyName: string): string | undefined;
    isRepeatFor(propertyName: string): boolean;
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


    @BaseElement.tapcAttribute('id')
    public attributeId: string;

    @BaseElement.tapcAttribute('name')
    public attributeName: string;

    @BaseElement.tapcAttribute('class')
    public attributeClass: string; // TODO: I think that we might want this to be a getter which joins a string array of classes

    /* Enhanced attributes from binding frameworks (i.e. Aurelia's binding engine) */
    @BaseElement.tapcAttribute('if')
    public attributeIf: string;

    @BaseElement.tapcAttribute('show')
    public attributeShow: string;

    @BaseElement.tapcAttribute('hide')
    public attributeHide: string;

    @BaseElement.tapcAttribute('repeat')
    @BaseElement.tapcRepeatFor()
    public attributeRepeat: string;

    private get _classes(): string[] {
        return this.attributeClass.split(' ');
    }

    /**
     * Add a style class to the element.
     * @param className 
     */
    public addClass(className: string): this {
        if (this._classes.length === 0 || this._classes.indexOf(className) === -1) {
            this.attributeClass = className + ' ' + this.attributeClass;
        }

        return this;
    }

    public static tapcAttributeMetadataKey = Symbol('tapcAttribute');
    public static tapcEventMetadataKey = Symbol('tapcEvent');
    public static tapcRepeatForMetadataKey = Symbol('tapcRepeat');

    public static tapcAttribute(attributeName: string): any {
        return Reflect.metadata(BaseElement.tapcAttributeMetadataKey, attributeName);
    }

    public static tapcEvent(eventName: string): any {
        return Reflect.metadata(BaseElement.tapcEventMetadataKey, eventName);
    }

    public static tapcRepeatFor(): any {
        return Reflect.metadata(BaseElement.tapcRepeatForMetadataKey, true);
    }

    /**
     *  Return the value of the tapcAttribute decorator for the passed property
     * or else return undefined (checks prototype chain)
     * @param propertyName The propertyname to check
     */
    public getAttributeName(propertyName: string): string | undefined {
        const result = Reflect.getMetadata(BaseElement.tapcAttributeMetadataKey, this, propertyName);
        return result;
    }

    /**
     *  Return the value of the tapcEvent decorator for the passed property
     * or else return undefined (checks prototype chain)
     * @param propertyName The propertyname to check
     */
    public getEventName(propertyName: string): string | undefined {
        const result = Reflect.getMetadata(BaseElement.tapcEventMetadataKey, this, propertyName);
        return result;
    }

    /**
     * If the property is for a repeat.for, then it should have the tapcRepeat decorator to indicate that
     * @param propertyName The propertyname to check
     */
    public isRepeatFor(propertyName: string): boolean {
        const result = Reflect.hasMetadata(BaseElement.tapcRepeatForMetadataKey, this, propertyName);
        return result ? true : false;
    }
}


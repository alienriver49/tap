/**
 * Using the reflect-metadata library which adds a polyfill for an experimental metadata API. 
 * This library is not yet part of the ECMAScript (JavaScript) standard. However, once 
 * decorators are officially adopted as part of the ECMAScript standard these extensions 
 * will be proposed for adoption.
 * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
import 'reflect-metadata';
import { AttributeMetadata } from '../metadata/attributeMetadata';
import { EventMetadata } from '../metadata/eventMetadata';
import { RepeatMetadata } from '../metadata/repeatMetadata';
import { SpecialHandlingMetadata } from '../metadata/specialHandlingMetadata';

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
    hasSpecialHandling(propertyName: string): boolean;
}

/**
 * Base element of UX components.
 */
export class BaseElement implements IBaseElement {
    constructor(config?: IBaseElementConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        
        this.attributeId = config.id || '';
        this.attributeName = config.name || '';
        this.attributeClass = config.class || '';
        this.attributeIf = config.if || '';
        this.attributeShow = config.show || '';
        this.attributeHide = config.hide || '';
        this.attributeRepeat = config.repeat || '';
    }


    @AttributeMetadata.set('id')
    public attributeId: string;

    @AttributeMetadata.set('name')
    public attributeName: string;

    @AttributeMetadata.set('class')
    public attributeClass: string; // TODO: I think that we might want this to be a getter which joins a string array of classes

    /* Enhanced attributes from binding frameworks (i.e. Aurelia's binding engine) */
    @AttributeMetadata.set('if')
    public attributeIf: string;

    @AttributeMetadata.set('show')
    public attributeShow: string;

    @AttributeMetadata.set('hide')
    public attributeHide: string;

    @AttributeMetadata.set('repeat')
    @RepeatMetadata.set()
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

    /**
     * Return the value of the AttributeMetadata.Set decorator for the passed property
     * or else return undefined (checks prototype chain)
     * @param propertyName The propertyname to check
     */
    public getAttributeName(propertyName: string): string | undefined {
        const result = Reflect.getMetadata(AttributeMetadata.key, this, propertyName);
        return result;
    }

    /**
     * Return the value of the EventMetadata.Set decorator for the passed property
     * or else return undefined (checks prototype chain)
     * @param propertyName The propertyname to check
     */
    public getEventName(propertyName: string): string | undefined {
        const result = Reflect.getMetadata(EventMetadata.key, this, propertyName);
        return result;
    }

    /**
     * If the property is for a repeat.for, then it should have the RepeatMetadata.Set decorator to indicate that
     * @param propertyName The propertyname to check
     */
    public isRepeatFor(propertyName: string): boolean {
        const result = Reflect.hasMetadata(RepeatMetadata.key, this, propertyName);
        return result ? true : false;
    }

    /**
     * If the property has special handling, then it should have the SpecialHandlingMetadata.Set decorator to indicate that
     * @param propertyName The propertyname to check
     */
    public hasSpecialHandling(propertyName: string): boolean {
        const result = Reflect.hasMetadata(SpecialHandlingMetadata.key, this, propertyName);
        return result ? true : false;
    }
}


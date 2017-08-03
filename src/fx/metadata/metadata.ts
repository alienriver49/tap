/**
 * Using the reflect-metadata library which adds a polyfill for an experimental metadata API. 
 * This library is not yet part of the ECMAScript (JavaScript) standard. However, once 
 * decorators are officially adopted as part of the ECMAScript standard these extensions 
 * will be proposed for adoption.
 * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
import 'reflect-metadata';

const tapmNoObserveMetadataKey = Symbol('tapcNoObserve');

/**
 * Use this to decorate properties that should not be observed in the extension
 * @decorator
 */
export function tapmNoObserve(): any {
    return Reflect.metadata(tapmNoObserveMetadataKey, null);
}

/**
 *  Return the value of the tapcAttribute decorator for the passed property
 * or else return undefined (checks prototype chain)
 * @param target The target object
 * @param propertyName The property name to check
 */
export function noObserve(target: object, propertyName: string): boolean {
    const result = Reflect.hasMetadata(tapmNoObserveMetadataKey, target, propertyName);
    return result ? true : false;
}

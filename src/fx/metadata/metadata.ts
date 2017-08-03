/**
 * Using the reflect-metadata library which adds a polyfill for an experimental metadata API. 
 * This library is not yet part of the ECMAScript (JavaScript) standard. However, once 
 * decorators are officially adopted as part of the ECMAScript standard these extensions 
 * will be proposed for adoption.
 * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
import 'reflect-metadata';

const noObserveMetadataKey = Symbol('tapcNoObserve');
const noSyncMetadataKey = Symbol('tapcNoSync');

/**
 * Use this to decorate properties that should not be observed in the extension
 * @decorator
 */
export function NoObserve(): any {
    return Reflect.metadata(noObserveMetadataKey, true);
}

/**
 *  Return the value of the tapmNoObserve decorator for the passed property
 * or else return undefined (checks prototype chain)
 * @param target The target object
 * @param propertyName The property name to check
 */
export function HasNoObserve(target: object, propertyName: string): boolean {
    const result = Reflect.hasMetadata(noObserveMetadataKey, target, propertyName);
    return result ? true : false;
}

/**
 * Use this to decorate functions that should not be synced to the portal
 * @decorator
 */
export function NoSync(): any {
    return Reflect.metadata(noSyncMetadataKey, true);
}

/**
 *  Return the value of the tapmNoSync decorator for the passed function
 * or else return undefined (checks prototype chain)
 * @param target The target object
 * @param propertyName The property name to check
 */
export function HasNoSync(target: object, propertyName: string): boolean {
    const result = Reflect.hasMetadata(noSyncMetadataKey, target, propertyName);
    return result ? true : false;
}

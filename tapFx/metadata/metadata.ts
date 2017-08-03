/**
 * Using the reflect-metadata library which adds a polyfill for an experimental metadata API. 
 * This library is not yet part of the ECMAScript (JavaScript) standard. However, once 
 * decorators are officially adopted as part of the ECMAScript standard these extensions 
 * will be proposed for adoption.
 * https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
 */
import 'reflect-metadata'

const NoObserveMetadataKey = Symbol("tapcNoObserve");
const NoSyncMetadataKey = Symbol("tapcNoSync");

/**
 * Use this to decorate properties that should not be observed in the extension
 * @decorator
 */
export function NoObserve(): any {
    return Reflect.metadata(NoObserveMetadataKey, true);
}

/**
 *  Return the value of the tapmNoObserve decorator for the passed property
 * or else return undefined (checks prototype chain)
 * @param target The target object
 * @param propertyName The property name to check
 */
export function HasNoObserve(target: Object, propertyName: string): boolean {
    let result = Reflect.hasMetadata(NoObserveMetadataKey, target, propertyName);
    return result ? true : false;
}

/**
 * Use this to decorate functions that should not be synced to the portal
 * @decorator
 */
export function NoSync(): any {
    return Reflect.metadata(NoSyncMetadataKey, true);
}

/**
 *  Return the value of the tapmNoSync decorator for the passed function
 * or else return undefined (checks prototype chain)
 * @param target The target object
 * @param propertyName The property name to check
 */
export function HasNoSync(target: Object, propertyName: string): boolean {
    let result = Reflect.hasMetadata(NoSyncMetadataKey, target, propertyName);
    return result ? true : false;
}

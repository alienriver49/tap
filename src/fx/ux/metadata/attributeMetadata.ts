import 'reflect-metadata';

export class AttributeMetadata {
    static Key: string = 'tapFxUxAttribute';

    static Set(attributeName: string): any {
        return Reflect.metadata(AttributeMetadata.Key, attributeName);
    }

    static Define(attributeName, target, propertyKey): void {
        Reflect.defineMetadata(AttributeMetadata.Key, attributeName, target, propertyKey);
    }
}
import 'reflect-metadata';

export class AttributeMetadata {
    public static key: string = 'tapFxUxAttribute';

    public static set(attributeName: string): any {
        return Reflect.metadata(AttributeMetadata.key, attributeName);
    }

    public static define(attributeName, target, propertyKey): void {
        Reflect.defineMetadata(AttributeMetadata.key, attributeName, target, propertyKey);
    }
}

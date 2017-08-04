import 'reflect-metadata';

export class EventMetadata {
    public static key: string = 'tapFxUxEvent';

    public static set(attributeName: string): any {
        return Reflect.metadata(EventMetadata.key, attributeName);
    }
}

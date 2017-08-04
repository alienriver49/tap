import 'reflect-metadata';

export class EventMetadata {
    static Key: string = 'tapFxUxEvent';

    static Set(attributeName: string): any {
        return Reflect.metadata(EventMetadata.Key, attributeName);
    }
}
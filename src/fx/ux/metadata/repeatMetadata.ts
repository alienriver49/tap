import 'reflect-metadata';

export class RepeatMetadata {
    static Key: string = 'tapFxUxRepeat';

    static Set(): any {
        return Reflect.metadata(RepeatMetadata.Key, true);
    }
}
import 'reflect-metadata';

export class RepeatMetadata {
    public static key: string = 'tapFxUxRepeat';

    public static set(): any {
        return Reflect.metadata(RepeatMetadata.key, true);
    }
}

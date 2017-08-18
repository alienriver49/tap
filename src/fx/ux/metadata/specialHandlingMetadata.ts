import 'reflect-metadata';

export class SpecialHandlingMetadata {
    public static key: string = 'tapFxUxSpecialHandling';

    public static set(): any {
        return Reflect.metadata(SpecialHandlingMetadata.key, true);
    }


}

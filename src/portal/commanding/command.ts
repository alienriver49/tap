/**
 * Commands definition.
 */
export class Command {
    constructor() { }

    /**
     * Identifies the extension to be loaded.
     */
    public extensionName: string;
    /**
     * An array of params fto be passed to the extension.
     */
    public params: string[];
    /**
     * An object of query string parameters. The query string keys make up the object keys.
     */
    public queryParams: object;
}

/**
 * Commands definition.
 */
class Command {
    constructor() { }

    /**
     * Identifies the extension to be loaded.
     */
    extensionName: string;
    /**
     * An array of params fto be passed to the extension.
     */
    params: string[];
    /**
     * An object of query string parameters. The query string keys make up the object keys.
     */
    queryParams: Object;
}

export default Command;
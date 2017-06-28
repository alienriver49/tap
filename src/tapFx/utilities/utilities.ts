class Utilities {
    /**
     * Returns a new GUID.
     */
    newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Returns the class of an object.
     * @param object 
     */
    classOf(object: any): string {
        return ({}).toString.call(object);
    }

    /**
     * Converts a query string into an object and returns that object. Supports query strings beginning with ? or not.
     * note: Doesn't handle all situations, like foo=bar&foo=foo for an array
     * @param queryString 
     */
    convertQueryStringToObject(queryString: string): Object {
        // if the query string is empty we will return an empty object
        if (queryString.length === 0) return {};

        // if the first char is ?, remove it
        let firstChar = queryString.substring(0, 1);
        if (firstChar === '?') queryString = queryString.substring(1);

        return JSON.parse('{"' + decodeURI(queryString.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
    }

    /**
     * Lowercase the first character of the passed string and pass it back.
     * @param str 
     */
    lowerCaseFirstChar(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    /**
     * Uppercase the first character of the passed string and pass it back.
     * @param str 
     */
    upperCaseFirstChar(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

export default Utilities;
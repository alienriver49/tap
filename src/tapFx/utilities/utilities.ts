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

    /**
     * Convert a camel case string to a hyphen delimited string by replacing upper-case letters with a hyphen and their lower-case equivalent, also known as kebab-case.
     * 
     * Note that if the beginning character is upper-case, it is ignored. i.e. either 'camelCase' or 'CamelCase' will both return 'camel-case' from this function.
     * @param str 
     */
    camelCaseToHyphen(str: string): string {
        str = this.lowerCaseFirstChar(str);
        if (/([A-Z]+)/.exec(str))
            return str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
        else
            // If there are no capital letters, just return input
            return str;
    }
}

export default Utilities;
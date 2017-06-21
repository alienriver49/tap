class Utilities {
    newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    classOf(object: any): string {
        return ({}).toString.call(object);
    }

    // Doesn't handle all situations, like foo=bar&foo=foo for an array
    convertQueryStringToObject(queryString: string): Object {
        return JSON.parse('{"' + decodeURI(queryString.substring(1).replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
    }

    lowerCaseFirstChar(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    upperCaseFirstChar(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

export default Utilities;
export class Utilities {
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
     * note: Doesn't handle all situations, i.e. ?foo=bar&foo=foo for an array
     * TODO: firm up implementation and add error checking, i.e. ?for=bar?foo=bar will error
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

    /** 
     * Test if the passed value is a plain object and not some derived object
     * like Array, Date, Map, etc
     * @param obj 
     */
    isObject(obj: any): boolean {
        return (obj === Object(obj) && this.classOf(obj) === '[object Object]');
    }

    /**
     * Get the current URL without hash or query params.
     */
    currentUrl(): string {
        let loc = document.location;
        return loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '') + loc.pathname;
    }

    /**
     * Get a random int between the passed min and max.
     * @param min 
     * @param max 
     */
    getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private _randomNouns: string[] = ['Pizza', 'Paper', 'Pencils', 'Rubber ducks', 'Coffee', 'Boxes', 'Books', 'Tea', 'Toys', 'Trinkets', 'Shinies', 'Telescope', 'Bike'];
    /**
     * Gets a random noun from an array of nouns.
     */
    getRandomNoun(): string {
        return this._randomNouns[this.getRandomInt(0, this._randomNouns.length - 1)]
    }

    /**
     * Determine if the passed value is a primitive javascript object
     * @param value 
     */
    public isPrimitive(value: any): boolean {
        let t = typeof value;
        return t !== 'object' && 
               t !== 'function';
    }    

    /**
     * For use with Name function to simulate the C# nameof function
     * This function just returns the passed function as a string
     * EX: this.Name(this.Of(() => this.address.line1));
     * @param fn 
     */
    public static Of(fn: any): string {
        var fnString = fn.toString();
        return fnString;
    }     

    /**
     * For use with Of function to simulate the C# nameof function
     * This function parses a function as a string and just returns the return value of it
     * (which is the what we want, the string name of a variable)
     * EX: this.Name(this.Of(() => this.address.line1));
     * @param fn 
     */
    public static Name(fnString: string): string {
        // fnString should look something like: function () { return _this.canActivate; }
        const nameofRegExp = /_this\.(.*);/;
        let match: RegExpExecArray | null;
        if(match = nameofRegExp.exec(fnString)){
            return match[1];
        }else{
            throw new Error(`Could not parse nameof string`);
        }
    }

    /**
     * This function is for use as a class decorator to add the Name and Of
     * functions on the class prototype
     * Works well... except Typescript doesn't know about the new functions on the class,
     * so doesn't have intellisense for them and underlines them with red as errors when
     * you try to use them
     * @param constructor 
     */
    public static includeNameof(constructor: Function) {
        constructor.prototype.Of = Utilities.Of;
        constructor.prototype.Name = Utilities.Name;
    }

    /**
     * Alternative method to implement C# nameof functionality
     * Makes use of the ES6 property shorthand feature where
     * {x} is a shortcut for {x: x}
     * https://stackoverflow.com/questions/37057211/how-to-get-the-name-of-a-variable-in-javascript-like-nameof-operator-in-c
     * Works great, however the property cannot have any dot notation in it, which
     * severely limits it's usefulness, since you can't use it with something like this.address
     * or address.line1
     * EX: this._tapFx.Utilities.nameof({address})
     * @param obj 
     */
    public static nameof(obj: Object): string {
        return Object.keys(obj)[0];
    }
}

export default Utilities;
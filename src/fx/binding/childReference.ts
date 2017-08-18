
export interface IChildReferenceConfig {
    type?: string;   
    propertyIndex?: Set<string>;   
    refCount?: number;   
    isKey?: boolean;      
}

/**
 * Class to keep track of all the 'child' objects, that are also being observed
 * and in the BindingEngine context map, on an object or in a
 * collection.  These child references are stored on BindingMap children property.
 * This class is also used to keep track of all the parent objects that 'contain'
 * an object as a child.  The tracking of children and parent references on 
 * mapped objects/collections is used when the value of a property or element changes on 
 * the object/collection and the old value was also observed and needs those observers
 * to be disposed of (unsubscribe observer callbacks and cleanup binding maps)
 * Note: an observed object can have zero, one or more parents and zero, one, or 
 * more 'children'
 */
export class ChildReference {
    /**
     * SerializedType of the child 
     */
    public type: string;   

    /**
     * For Arrays, the indexes that reference the object
     * For Objects, the properties that reference the object
     */
    public propertyIndex: Set<string>;   

    /**
     * For Maps, the number of times the object is a value in the entries
     */
    public refCount: number;   

    /**
     * For Maps, indicates the object is a key in the Map
     */
    public isKey: boolean;      

    constructor(config?: IChildReferenceConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        this.type = config.type || '';
        this.propertyIndex = config.propertyIndex || new Set<string>();
        this.refCount = config.refCount || 0;
        this.isKey = config.isKey || false;
    }
}

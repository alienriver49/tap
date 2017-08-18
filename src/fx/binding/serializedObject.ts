export interface ISerializedObjectConfig {
    property?: string;   
    contextId?: string;  
    parentId?: string;   
    value?: any;         
    type?: string;
    childMetadata?: SerializedObject[];
    functions?: string[];
    view?: string;
    viewName?: string;
}

/**
 * This defines the format of objects being serialized between windows
 */
export class SerializedObject {
    // Name of property or index of this data on a parent object or collection
    public property: string;   

    // The GUID that identifies this data in the binding maps (not used for primitives)
    public contextId: string;  

    // The GUID that identifies the object or collection that this data lives on
    public parentId: string;   

    // For primitives, the actual value of the data
    // For dates, the ISO string value of the date
    // For collections, the collection where each element may be a primitive or another ISerializedObject
    // For objects, a plain object with all primitive properties, complex properties for the object are
    //      defined in the childMetadata array
    public value: any;         

    // Defines the type of this data (see SerializedType for possible values)
    public type: string;
    
    // If the data is an object with non-primitive properties, they require their metadata and that
    // is stored in this childMetadata array
    public childMetadata: SerializedObject[];

    // Array of functions that are serialized as part of this object
    public functions: string[];

    // String of HTML that represents the view for this object type
    public view: string;

    // A name for the view associated with this object type
    // Used to register a view resource with Aurelia
    public viewName: string;

    constructor(config?: ISerializedObjectConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        this.contextId = config.contextId || '';
        this.property = config.property || '';
        this.parentId = config.parentId || '';
        this.value = config.value || undefined;
        this.type = config.type || '';
        this.childMetadata = config.childMetadata || [];
        this.functions = config.functions || [];
        this.view = config.view || '';
        this.viewName = config.viewName || '';
    }
}

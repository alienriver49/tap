
import { ProxiedObservable } from './proxiedObservable';
import { ProxiedCollectionObservable } from './proxiedCollectionObservable';

export interface IChildReference {
    type: string;   // ISerializedType of the child 
    propertyIndex: Set<string>;   // For Arrays, the indexes that reference the object
                                  // For Objects, the properties that reference the object
    refCount: number;   // For Maps, the number of times the object is a value in the entries
    isKey: boolean;      // For Maps, indicates the object is a key in the Map
}

/**
 * Collects binding and association information on a particular object or collection
 * that is being observed by the BindingEngine
 */
export class BindingMap {
    // ISerializedType of the object associated with the instance
    public type: string;

    // If this bindingmap is for an object, these are all the property observers
    public observers: ProxiedObservable[];

    // If this bindingmap is for a collection, this is the collection observer that
    // watches for changes to the contents of the collection
    public collectionObserver: ProxiedCollectionObservable | undefined;

    // Map of all the parent object/collections in the contextMap that contain 
    // a reference to this object
    // Map key is a parent contextId
    // Map value is an IChildReference that indicates the properties, indexes, etc
    //      on the key object that reference this object/collection
    public parents: Map<string, IChildReference>;

    // Map of all the children on this object/collection that are also in the context
    // Map key is a child contextId
    // Map value is an IChildReference that indicates the properties, indexes, etc
    //      that the key object is referenced by on the object/collection
    public children: Map<string, IChildReference>;

    constructor(
        type: string,
        observers: ProxiedObservable[],
        observer: ProxiedCollectionObservable | undefined,
        parents: Map<string, IChildReference>,
        children: Map<string, IChildReference>) {
            this.type = type;
            this.observers = observers;
            this.collectionObserver = observer;
            this.parents = parents;
            this.children = children;
    }
}

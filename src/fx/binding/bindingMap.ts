
import { ProxiedObservable } from './proxiedObservable';
import { ProxiedCollectionObservable } from './proxiedCollectionObservable';
import { ChildReference } from './childReference';
import { RpcClient, IRpcClientSubscription } from '../rpc/client';


export interface IBindingMapConfig {
    type?: string;
    observers?: ProxiedObservable[];
    collectionObserver?: ProxiedCollectionObservable | undefined;
    parents?: Map<string, ChildReference>;
    children?: Map<string, ChildReference>;
    functionSubscriptions?: IRpcClientSubscription[];
}

/**
 * Collects binding and association information on a particular object or collection
 * that is being observed by the BindingEngine
 */
export class BindingMap {
    /**
     * SerializedType of the object associated with the instance
     */
    public type: string;

    /**
     * If this bindingmap is for an object, these are all the property observers
     */
    public observers: ProxiedObservable[];

    /**
     * If this bindingmap is for a collection, this is the collection observer that
     * watches for changes to the contents of the collection
     */
    public collectionObserver: ProxiedCollectionObservable | undefined;

    /**
     * Map of all the parent object/collections in the contextMap that contain 
     * a reference to this object
     * Map key is a parent contextId
     * Map value is an IChildReference that indicates the properties, indexes, etc
     *     on the key object that reference this object/collection
     */
    public parents: Map<string, ChildReference>;

    /**
     * Map of all the children on this object/collection that are also in the context
     * Map key is a child contextId
     * Map value is an IChildReference that indicates the properties, indexes, etc
     *      that the key object is referenced by on the object/collection
     */
    public children: Map<string, ChildReference>;

    /**
     * Subscriptions for the object's functions' calls 
     */
    public functionSubscriptions: IRpcClientSubscription[];

    constructor(config?: IBindingMapConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        this.type = config.type || '';
        this.observers = config.observers || [];
        this.collectionObserver = config.collectionObserver || undefined;
        this.parents = config.parents || new Map<string, ChildReference>();
        this.children = config.children || new Map<string, ChildReference>();
        this.functionSubscriptions = config.functionSubscriptions || [];
    }
}

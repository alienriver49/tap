import { inject } from 'aurelia-dependency-injection'
import Utilities from './../utilities/utilities'

/**
 * Object returned by the call to subscribe that contains an unsubscribe function
 */
export interface RpcClientSubscription {
    unsubscribe: () => void;
}

/**
 * Object passed to the subscription callbacks when a message of the associated
 * type arrives
 */
export interface RpcClientSubscriptionCallbackData {
    messageType: string;
    data: any;
}

/**
 * Subscription notification callback function signature
 */
export declare type RpcClientSubscriptionCallback = (RpcClientSubscriptionCallbackData) => void;

/**
 * Properties of the dispatched message object
 */
interface IDispatchedMessage {
    // Object passed from other window
    data: any,
    // Origin of the window that sent the message
    origin: string,
    // Reference to window object that sent the message
    source: Window
}

/**
 * Provide subscription based messaging between a root window and child iframe windows
 * Messaging between iframes is not supported
 * By default all root window messages are sent to all iframes on the root window.  Limiting
 * messages to specific iframes can be accomplished by either:
 * 1) setting the InstanceId via the setInstanceId method in iframes
 * 2) Ensuring all iframes have a top-level 'id' attribute that is unique and calling 
 *      setUseFrameIdAddressing(true) from the root window
 * They both do the same thing, but in different ways.  The first filters messages on the 
 * destination.  The second filters messages at the source.  In both cases, the root window
 * must know the iframe destination instance Id when publishing a message for the filtering
 * to work.
 * 
 * Messages from iframes to the root window do not require filtering.
 */
@inject(Utilities)
export class RpcClient {
    constructor(
        private _utilities: Utilities
    ) {
        // Listen for window.postMessage calls and handle them 
        window.addEventListener('message', this._onWindowMessage, false);
        this._setInternalId();
        this._inIFrame();
        console.log(`[TAP-FX][${this._className}][${this._guid}][${this._isInIFrame ? "IFRAME" : "SHELL"}] RpcClient constructor`);
    }

    private _guid: string;  // Internal instance identifier
    private _className: string = (this as Object).constructor.name;
    private _subscriptionLookup: { [messageType: string]: RpcClientSubscriptionCallback[] } = {};
    private _isInIFrame: boolean | null = null;
    public InstanceId: string = 'all';
    private _useFrameIdAddressing: boolean = false;

    /**
     * Set the internal guid of this RPC client.
     * @internal
     */
    private _setInternalId(): void {
        this._guid = this._utilities.newGuid();
    }

    /**
     * Determine if the current page is in an iFrame or not
     * The result is cached in _isInIFrame after the first call
     * @internal
     * @returns {boolean} true if in an iFrame
     */
    private _inIFrame(): boolean {
        if (this._isInIFrame !== null)
            return this._isInIFrame
        try {
            return this._isInIFrame = (window.self !== window.top);
        } catch (e) {
            return true;
        }
    }

    private _onWindowMessage = ((message: IDispatchedMessage): void => {
        // Ignore messages that have a different destination Ids unless the instance accepts all messages 
        if (message && message.data && message.data.messageType && message.data.destId /*&& message.data.messageData*/ &&
            (message.data.destId === this.InstanceId || this.InstanceId === 'all' || message.data.destId === 'all')) {
            this._notifySubscriber(message.data.messageType, message.data.messageData);
        }
    }).bind(this);

    /**
     * Notify subscribers of a new message by invoking the callbacks with the message data
     * @internal
     * @param {string} messageType 
     * @param {any?} data 
     */
    private _notifySubscriber(messageType: string, data?: any) {
        // passed data should be prevalidated by publish function
        let subscriptions = this._subscriptionLookup[messageType];
        if (subscriptions) {
            subscriptions = subscriptions.slice();
            let i = subscriptions.length;
            while (i--) {
                try {
                    subscriptions[i](data);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    /**
     * Creates a subscription to window.postMessages for the passed messageType.  When a
     * message of that type is sent, the passed callback function will be called with 
     * the data from the message. 
     * @param {string} messageType Unique string identifying the type of message
     * @param {function} data - data to pass 
     * @returns {RpcClientSubscription} An object that contains a reference to an unsubscribe
     * function that should be called when the subscription is no longer needed 
     */
    subscribe(messageType: string, callback: RpcClientSubscriptionCallback): RpcClientSubscription {
        if (!messageType || typeof messageType !== 'string') {
            throw new Error('RpcClient.subscribe: Event type was invalid.');
        }

        let subscribers = this._subscriptionLookup[messageType] || (this._subscriptionLookup[messageType] = []);
        subscribers.push(callback);

        return {
            unsubscribe: (): void => {
                let index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            }
        }
    }

    /**
     * Publishes the passed messageType and data (encapsulated in a new object) to other pages
     * via the windows.postMessage method
     * @param {string} messageType Unique string identifying the type of message
     * @param {string} destId Unique string identifying destination; only applicable when publishing
     * from the root window.  If null or empty, defaults to 'all' and is sent to all iframes.
     * @param {any?} data - data to pass 
     * @returns {void} 
     */
    publish(messageType: string, destId?: string, data?: any): void {
        if (!messageType || typeof messageType !== 'string') {
            throw new Error('RpcClient.publish: Message type was invalid.');
        }
        if (destId !== undefined && typeof destId !== 'string') {
            throw new Error('RpcClient.publish: Destination Id must be a string.');
        }

        // Default publish to all subscribers for the message type
        if (destId === undefined || !destId) {
            destId = 'all';
        }

        let message = {
            messageType: messageType,
            destId: destId,
            messageData: data
        };

        // publish to parent iFrame
        if (this._inIFrame()) {
            window.parent.postMessage(message, '*');
            return;
        }

        // publish to child iFrames
        let i = window.frames.length;
        let messageSent = false;
        while (i--) {
            if (!this._useFrameIdAddressing || destId === 'all') {
                window.frames[i].postMessage(message, '*');
                messageSent = true;
            } else {
                // If the destination isn't all children, then only post message to frame with matching Id
                let frameId = window.frames[i].getAttribute('id');
                if (frameId && frameId === destId) {
                    window.frames[i].postMessage(message, '*');
                    messageSent = true;
                }
            }
        }
        if (!messageSent)
            console.warn(`RpcClient.publish: Message not sent, unable to find iframe with id "${destId}"')`);
    }

    /**
     * Set the unique string identifying the instance.  This is used to only handle
     * messages that have this as the destination id.  Only applicable to iframes
     * @param {string} id Unique string identifying the instance
     * @returns {void} 
     */
    setInstanceId(id: string): void {
        if (!id || typeof id !== 'string') {
            throw new Error('RpcClient.setInstanceId: id was invalid.');
        }
        this.InstanceId = id;
    }

    /**
     * Determines if iframes have a top-level 'id' property that should be used for determining which
     * iframes to send messages to.  This property is only applicable to root windows (not iframes).  
     * @param {boolean} [doFramesHaveIds] If true, all iframes must have a top-level 'id' property
     * that matches the id parameter and will be used to only send messages to the appropriate iframe windows
     * @returns {void} 
     */
    setUseFrameIdAddressing(useFrameIdAddressing: boolean): void {
        this._useFrameIdAddressing = useFrameIdAddressing;
    }

}

export default RpcClient;
interface Subscription {
    unsubscribe: () => void;
}

class RpcClient {
    constructor() {
        window.addEventListener('message', this._onWindowMessage, false);
    }

    private _subscriptionLookup: { [eventId: string]: Function[] } = {};

    private _inIFrame(): boolean {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    private _onWindowMessage = ((message: any): void => {
        if (message && message.data) {
            this._notifySubscriber(message.data.eventId, message.data.eventData);
        }
    }).bind(this);

    private _notifySubscriber(eventId: string, data?: any) {
        let subscriptions = this._subscriptionLookup[eventId];
        if (subscriptions) {
            subscriptions = subscriptions.slice();
            let i = subscriptions.length;
            while (i--) {
                try {
                    subscriptions[i](data, eventId);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    subscribe(eventId: string, callback: Function): Subscription {
        if (!eventId || typeof eventId !== 'string') {
            throw new Error('Event type was invalid.');
        }

        let subscribers = this._subscriptionLookup[eventId] || (this._subscriptionLookup[eventId] = []);
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

    publish(eventId: string, data?: any): void {
        if (!eventId || typeof eventId !== 'string') {
            throw new Error('Event type was invalid.');
        }

        // no need to notify local subscribers when publishing to RPC        
        //this._notifySubscriber(eventId, data);

        let message = {
            eventId: eventId,
            eventData: data
        };

        // publish to parent iFrame
        if (this._inIFrame()) {
            window.parent.postMessage(message, '*');
        }

        // publish to child iFrames
        // TODO: modify to publish to a specific iFrame directly
        let i = window.frames.length;
        while (i--) {
            window.frames[i].postMessage(message, '*');
        }
    }
}

export default RpcClient;
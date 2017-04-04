module TapFx.Rpc {
    interface Subscription {
        unsubscribe: () => void;
    }

    interface EventBusConfiguration {
        enableCrossOriginEvents: boolean;
    }

    export class EventBus {
        constructor({ config = { enableCrossOriginEvents: true } } = {}) {
            if (config.enableCrossOriginEvents) {
                window.addEventListener('message', this.onWindowMessage, false);
            }
            this._config = config;
        }

        private static _instance: EventBus;

        private _config: EventBusConfiguration;

        private _subscriptionLookup: { [eventId: string]: Function[] } = {};

        private inIFrame(): boolean {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        }

        private onWindowMessage = ((message: any): void => {
            if (message && message.data) {
                this.notifySubscriber(message.data.eventId, message.data.eventData);
            }
        }).bind(this);

        private notifySubscriber(eventId: string, data?: any) {
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

        static getDefault() {
            let instance = this._instance || (this._instance = new EventBus());
            return instance;
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

            this.notifySubscriber(eventId, data);

            if (this._config.enableCrossOriginEvents) {
                let message = {
                    eventId: eventId,
                    eventData: data
                };

                // publish to parent iFrame
                if (this.inIFrame()) {
                    window.parent.postMessage(message, '*');
                }

                // publish to child iFrames
                let i = window.frames.length;
                while (i--) {
                    window.frames[i].postMessage(message, '*');
                }
            }
        }
    }
}
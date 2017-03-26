var EventBus = (function () {
        function EventBus(_a) {
            var _b = (_a === void 0 ? {} : _a).config, config = _b === void 0 ? { enableCrossOriginEvents: true } : _b;
            var _this = this;
            this._subscriptionLookup = {};
            this.onWindowMessage = (function (message) {
                if (message && message.data) {
                    _this.notifySubscriber(message.data.eventId, message.data.eventData);
                }
            }).bind(this);
            if (config.enableCrossOriginEvents) {
                window.addEventListener('message', this.onWindowMessage, false);
            }
            this._config = config;
        }
        EventBus.prototype.inIFrame = function () {
            try {
                return window.self !== window.top;
            }
            catch (e) {
                return true;
            }
        };
        EventBus.prototype.publishToParentIFrame = function (message) {
            if (this.inIFrame()) {
                window.parent.postMessage(message, '*');
            }
        };
        EventBus.prototype.publishToChildIFrames = function (message) {
            var i = window.frames.length;
            while (i--) {
                window.frames[i].postMessage(message, '*');
            }
        };
        EventBus.prototype.notifySubscriber = function (eventId, data) {
            var subscriptions = this._subscriptionLookup[eventId];
            if (subscriptions) {
                subscriptions = subscriptions.slice();
                var i = subscriptions.length;
                while (i--) {
                    try {
                        subscriptions[i](data, eventId);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
        };
        EventBus.getDefault = function () {
            var instance = this._instance || (this._instance = new EventBus());
            return instance;
        };
        EventBus.prototype.subscribe = function (eventId, callback) {
            if (!eventId || typeof eventId !== 'string') {
                throw new Error('Event type was invalid.');
            }
            var subscribers = this._subscriptionLookup[eventId] || (this._subscriptionLookup[eventId] = []);
            subscribers.push(callback);
            return {
                unsubscribe: function () {
                    var index = subscribers.indexOf(callback);
                    if (index !== -1) {
                        subscribers.splice(index, 1);
                    }
                }
            };
        };
        EventBus.prototype.publish = function (eventId, data) {
            if (!eventId || typeof eventId !== 'string') {
                throw new Error('Event type was invalid.');
            }
            this.notifySubscriber(eventId, data);
            if (this._config.enableCrossOriginEvents) {
                var message = {
                    eventId: eventId,
                    eventData: data
                };
                this.publishToParentIFrame(message);
                this.publishToChildIFrames(message);
            }
        };
        return EventBus;
    }());

window.EventBus = EventBus;
var TapFx = (function () {
'use strict';

function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


var Utilities = Object.freeze({
	newGuid: newGuid
});

var Rpc = (function () {
    function Rpc() {
        var _this = this;
        this._subscriptionLookup = {};
        this.onWindowMessage = (function (message) {
            if (message && message.data) {
                _this.notifySubscriber(message.data.eventId, message.data.eventData);
            }
        }).bind(this);
        window.addEventListener('message', this.onWindowMessage, false);
    }
    Rpc.prototype.inIFrame = function () {
        try {
            return window.self !== window.top;
        }
        catch (e) {
            return true;
        }
    };
    Rpc.prototype.notifySubscriber = function (eventId, data) {
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
    Rpc.prototype.subscribe = function (eventId, callback) {
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
    Rpc.prototype.publish = function (eventId, data) {
        if (!eventId || typeof eventId !== 'string') {
            throw new Error('Event type was invalid.');
        }
        this.notifySubscriber(eventId, data);
        var message = {
            eventId: eventId,
            eventData: data
        };
        // publish to parent iFrame
        if (this.inIFrame()) {
            window.parent.postMessage(message, '*');
        }
        // publish to child iFrames
        var i = window.frames.length;
        while (i--) {
            window.frames[i].postMessage(message, '*');
        }
    };
    return Rpc;
}());
var Rpc$1 = new Rpc();

var index = {
    Utilities: Utilities,
    Rpc: Rpc$1
};

return index;

}());

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

class RpcClient {
    constructor() {
        this._subscriptionLookup = {};
        this._onWindowMessage = ((message) => {
            if (message && message.data) {
                this._notifySubscriber(message.data.eventId, message.data.eventData);
            }
        }).bind(this);
        window.addEventListener('message', this._onWindowMessage, false);
    }
    _inIFrame() {
        try {
            return window.self !== window.top;
        }
        catch (e) {
            return true;
        }
    }
    _notifySubscriber(eventId, data) {
        let subscriptions = this._subscriptionLookup[eventId];
        if (subscriptions) {
            subscriptions = subscriptions.slice();
            let i = subscriptions.length;
            while (i--) {
                try {
                    subscriptions[i](data, eventId);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }
    subscribe(eventId, callback) {
        if (!eventId || typeof eventId !== 'string') {
            throw new Error('Event type was invalid.');
        }
        let subscribers = this._subscriptionLookup[eventId] || (this._subscriptionLookup[eventId] = []);
        subscribers.push(callback);
        return {
            unsubscribe: () => {
                let index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            }
        };
    }
    publish(eventId, data) {
        if (!eventId || typeof eventId !== 'string') {
            throw new Error('Event type was invalid.');
        }
        this._notifySubscriber(eventId, data);
        let message = {
            eventId: eventId,
            eventData: data
        };
        // publish to parent iFrame
        if (this._inIFrame()) {
            window.parent.postMessage(message, '*');
        }
        // publish to child iFrames
        let i = window.frames.length;
        while (i--) {
            window.frames[i].postMessage(message, '*');
        }
    }
}
var RpcClient$1 = new RpcClient();

class Blade {
    constructor() {
        this.title = 'hello';
    }
}

class ExtensionLoaderEngine {
    constructor() {
    }
    addBlade(blade) {
        console.log('now i have to add a blade', blade);
    }
}
var ExtensionLoaderEngine$1 = new ExtensionLoaderEngine();

class ExtensionManager {
    constructor() {
    }
    addBlade(blade) {
        ExtensionLoaderEngine$1.addBlade(blade);
    }
}
var ExtensionManager$1 = new ExtensionManager();

var index = {
    Utilities: Utilities,
    Rpc: RpcClient$1,
    ViewModels: {
        Blade: Blade
    },
    ExtensionManager: ExtensionManager$1
};

return index;

}());

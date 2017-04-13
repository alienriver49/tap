define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});

define('main',["require", "exports", "./environment"], function (require, exports, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Promise.config({
        warnings: {
            wForgottenReturn: false
        }
    });
    function configure(aurelia) {
        aurelia.use
            .standardConfiguration()
            .feature('resources');
        if (environment_1.default.debug) {
            aurelia.use.developmentLogging();
        }
        if (environment_1.default.testing) {
            aurelia.use.plugin('aurelia-testing');
        }
        aurelia.start().then(function () { return aurelia.setRoot('shell/shell'); });
    }
    exports.configure = configure;
});

define('resources/index',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(config) {
    }
    exports.configure = configure;
});

define('shell/shell',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Shell = (function () {
        function Shell() {
            this._subscriptions = [];
            this.extensions = [];
        }
        Shell.prototype.fakeExtension1Load = function () {
            var extensionLoadingInfo = {
                id: 'extension-1',
                files: [
                    './src/tap-fx-dist/tap-rpc/event-bus.js',
                    './src/tap-fx-dist/tap-ux/view-models/view-models.blade.js',
                    './src-extensions/extension-1-dist/main-blade.js',
                    './src-extensions/extension-1-dist/app.js',
                ]
            };
            return extensionLoadingInfo;
        };
        Shell.prototype.interceptModelUpdate = function (method, update, value) {
            console.log('THE UPDATED VALUE IS', value);
            update(value);
        };
        Shell.prototype.handleNewBladeMessage = function (message) {
            console.log('SHELL', 'RECEIVE', 'extension.new-blade', message);
        };
        Shell.prototype.activate = function (params, routeConfig) {
            console.log('SHELL: activate');
            this.registerEventBus();
        };
        Shell.prototype.loadExtension = function (id) {
            var extensionLoadingInfo;
            switch (id) {
                case '1':
                    extensionLoadingInfo = this.fakeExtension1Load();
                    break;
                default: throw new Error('Unknow extension ID specified.');
            }
            var iFrame = document.createElement('iframe');
            document.querySelector('#extension-iframes').appendChild(iFrame);
            extensionLoadingInfo.files.forEach(function (filePath) {
                var scriptTag = iFrame.contentWindow.document.createElement('script');
                scriptTag.setAttribute('type', 'text/javascript');
                scriptTag.setAttribute('src', filePath);
                iFrame.contentWindow.document.body.appendChild(scriptTag);
            });
            iFrame.setAttribute('id', extensionLoadingInfo.id);
            iFrame.setAttribute('src', 'about:blank');
            iFrame.setAttribute('sandbox', '');
            this.extensions.push(extensionLoadingInfo.id);
            setTimeout(function () {
                var vm = iFrame.contentWindow.create();
                console.log('...and the VM is: ', vm);
                vm.onInitialize();
            }, 1000);
        };
        Shell.prototype.unloadExtension = function (id) {
        };
        Shell.prototype.registerEventBus = function () {
            this._subscriptions.push(TapFx.Rpc.EventBus.getDefault().subscribe('extension.new-blade', this.handleNewBladeMessage));
        };
        Shell.prototype.unregisterEventBus = function () {
            while (this._subscriptions.length) {
                this._subscriptions.pop().unsubscribe();
            }
        };
        return Shell;
    }());
    exports.Shell = Shell;
});

define('resources/binding-behaviors/intercept',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var interceptMethods = ['updateTarget', 'updateSource', 'callSource'];
    var InterceptBindingBehavior = (function () {
        function InterceptBindingBehavior() {
        }
        InterceptBindingBehavior.prototype.bind = function (binding, source, interceptor) {
            console.log('THIS IS EXCITING: ABOUT TO BIND', binding, interceptor);
            var i = interceptMethods.length;
            while (i--) {
                var method = interceptMethods[i];
                if (!binding[method]) {
                    continue;
                }
                binding["intercepted-" + method] = binding[method];
                var update = binding[method].bind(binding);
                binding[method] = interceptor.bind(binding, method, update);
            }
        };
        InterceptBindingBehavior.prototype.unbind = function (binding, source) {
            console.log('THIS IS EXCITING: ABOUT TO UNBIND', binding, source);
            var i = interceptMethods.length;
            while (i--) {
                var method = interceptMethods[i];
                if (!binding[method]) {
                    continue;
                }
                binding[method] = binding["intercepted-" + method];
                binding["intercepted-" + method] = null;
            }
        };
        return InterceptBindingBehavior;
    }());
    exports.InterceptBindingBehavior = InterceptBindingBehavior;
});

var TapFx;
(function (TapFx) {
    var Rpc;
    (function (Rpc) {
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
                    if (this.inIFrame()) {
                        window.parent.postMessage(message, '*');
                    }
                    var i = window.frames.length;
                    while (i--) {
                        window.frames[i].postMessage(message, '*');
                    }
                }
            };
            return EventBus;
        }());
        Rpc.EventBus = EventBus;
    })(Rpc = TapFx.Rpc || (TapFx.Rpc = {}));
})(TapFx || (TapFx = {}));

define("tap-fx/tap-rpc/event-bus", [],function(){});

var TapFx;
(function (TapFx) {
    var Ux;
    (function (Ux) {
        var ViewModels;
        (function (ViewModels) {
            var Blade = (function () {
                function Blade() {
                }
                return Blade;
            }());
            ViewModels.Blade = Blade;
        })(ViewModels = Ux.ViewModels || (Ux.ViewModels = {}));
    })(Ux = TapFx.Ux || (TapFx.Ux = {}));
})(TapFx || (TapFx = {}));

define("tap-fx/tap-ux/view-models/view-models.blade", [],function(){});

define('text!shell/shell.html', ['module'], function(module) { module.exports = "<template><require from=\"resources/binding-behaviors/intercept\"></require><h1>Shell</h1><div><button type=\"button\" click.delegate=\"loadExtension('1')\">Load Extension 1</button> <button type=\"button\" click.delegate=\"unloadExtension('1')\">Unload Extension 1</button></div><br><div><button type=\"button\" click.delegate=\"registerEventBus()\">Register Event Bus</button> <button type=\"button\" click.delegate=\"unregisterEventBus()\">Unregister Event Bus</button></div><h1>Extension iFrames: ${extensions.length}</h1><div repeat.for=\"extensionId of extension\">${extensionId}</div><div id=\"extension-iframes\"></div><h1>Extension UIs</h1><div id=\"extensions\"></div></template>"; });
define('text!tap-fx/tap-ux/view-models/view-models.blade.html', ['module'], function(module) { module.exports = "<template><div>I am a Blade!</div><input type=\"text\" bind.value=\"title\"></template>"; });
//# sourceMappingURL=app-bundle.js.map
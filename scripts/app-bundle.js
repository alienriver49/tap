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
        aurelia.start().then(function () { return aurelia.setRoot('app/app'); });
    }
    exports.configure = configure;
});

define('app/app',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = (function () {
        function App() {
            this._subscriptions = [];
            this.extensions = [];
        }
        App.prototype.fakeExtension1Load = function () {
            var extensionLoadingInfo = {
                id: 'extension-1',
                files: [
                    'dist-tap-fx/tap-fx-bundle.js',
                    'dist-tap-extensions/extension-1/extension-1-bundle.js',
                ]
            };
            return extensionLoadingInfo;
        };
        App.prototype.interceptModelUpdate = function (method, update, value) {
            console.log('THE UPDATED VALUE IS', value);
            update(value);
        };
        App.prototype.loadExtension = function (id) {
            var extensionLoadingInfo;
            switch (id) {
                case '1':
                    extensionLoadingInfo = this.fakeExtension1Load();
                    break;
                default: throw new Error('Unknow extension ID specified.');
            }
            var iFrame = document.createElement('iframe');
            iFrame.setAttribute('id', extensionLoadingInfo.id);
            iFrame.setAttribute('src', 'about:blank');
            document.querySelector('#extension-iframes').appendChild(iFrame);
            extensionLoadingInfo.files.forEach(function (filePath) {
                var scriptTag = iFrame.contentWindow.document.createElement('script');
                scriptTag.setAttribute('type', 'text/javascript');
                scriptTag.setAttribute('src', filePath);
                iFrame.contentWindow.document.body.appendChild(scriptTag);
            });
            iFrame.setAttribute('sandbox', '');
            this.extensions.push(extensionLoadingInfo.id);
        };
        return App;
    }());
    exports.App = App;
});

define('resources/index',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(config) {
    }
    exports.configure = configure;
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

define('text!app/app.html', ['module'], function(module) { module.exports = "<template><require from=\"resources/binding-behaviors/intercept\"></require><h1>TapFx POC</h1><div><button type=\"button\" click.delegate=\"loadExtension('1')\">Load Extension 1</button></div><br><h1>Extension iFrames: ${extensions.length}</h1><div repeat.for=\"extensionId of extension\">${extensionId}</div><div id=\"extension-iframes\"></div><h1>Extension UIs</h1><div id=\"extensions\"></div></template>"; });
//# sourceMappingURL=app-bundle.js.map
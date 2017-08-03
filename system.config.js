System.config({
  defaultJSExtensions: true,
  transpiler: "typescript",
  typescriptOptions: {
    "target": "es5",
    "module": "es6",
    "moduleResolution": "node",
    "allowJs": true,
    "noImplicitAny": false,
    "removeComments": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictNullChecks": true,
    "sourceMap": true
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  packages: {
    "src/exts": {
      "defaultJSExtensions": true,
      "defaultExtension": "ts"
    },
    "src/portal": {
      "defaultJSExtensions": true,
      "defaultExtension": "ts"
    },
    "src/fx": {
      "defaultJSExtensions": true,
      "defaultExtension": "ts"
    },
    "src/webComponents": {
      "defaultJSExtensions": true,
      "defaultExtension": "ts"
    }
  },

  meta: {
    "*.css": {
      "loader": "css"
    }
  },

  map: {
    "@material/button": "npm:@material/button@0.3.9",
    "@material/checkbox": "npm:@material/checkbox@0.4.0",
    "@material/ripple": "npm:@material/ripple@0.8.0",
    "aurelia-auth": "npm:aurelia-auth@3.0.5",
    "aurelia-binding": "npm:aurelia-binding@1.2.1",
    "aurelia-bootstrapper": "npm:aurelia-bootstrapper@2.1.1",
    "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
    "aurelia-event-aggregator": "npm:aurelia-event-aggregator@1.0.1",
    "aurelia-fetch-client": "npm:aurelia-fetch-client@1.1.2",
    "aurelia-framework": "npm:aurelia-framework@1.1.2",
    "aurelia-history": "npm:aurelia-history@1.0.0",
    "aurelia-html-import-template-loader": "npm:aurelia-html-import-template-loader@1.0.0",
    "aurelia-loader": "npm:aurelia-loader@1.0.0",
    "aurelia-loader-default": "npm:aurelia-loader-default@1.0.2",
    "aurelia-logging-console": "npm:aurelia-logging-console@1.0.0",
    "aurelia-pal": "npm:aurelia-pal@1.3.0",
    "aurelia-pal-browser": "npm:aurelia-pal-browser@1.2.1",
    "aurelia-templating": "npm:aurelia-templating@1.4.2",
    "aurelia-templating-binding": "npm:aurelia-templating-binding@1.3.0",
    "bootstrap": "github:twbs/bootstrap@3.3.7",
    "bootstrap-css": "github:twbs/bootstrap@3.3.7/css/bootstrap.min.css",
    "css": "github:systemjs/plugin-css@0.1.35",
    "material-components-web": "npm:material-components-web@0.15.0",
    "moment": "npm:moment@2.18.1",
    "numeral": "npm:numeral@2.0.6",
    "reflect-metadata": "npm:reflect-metadata@0.1.10",
    "tap-fx": "src/fx/index",
    "typescript": "npm:typescript@2.4.1",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.4.1"
    },
    "github:jspm/nodelibs-buffer@0.1.1": {
      "buffer": "npm:buffer@5.0.6"
    },
    "github:jspm/nodelibs-constants@0.1.0": {
      "constants-browserify": "npm:constants-browserify@0.0.1"
    },
    "github:jspm/nodelibs-crypto@0.1.0": {
      "crypto-browserify": "npm:crypto-browserify@3.11.0"
    },
    "github:jspm/nodelibs-events@0.1.1": {
      "events": "npm:events@1.0.2"
    },
    "github:jspm/nodelibs-http@1.7.1": {
      "Base64": "npm:Base64@0.2.1",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "url": "github:jspm/nodelibs-url@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "github:jspm/nodelibs-net@0.1.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "http": "github:jspm/nodelibs-http@1.7.1",
      "net": "github:jspm/nodelibs-net@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "timers": "github:jspm/nodelibs-timers@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "github:jspm/nodelibs-os@0.1.0": {
      "os-browserify": "npm:os-browserify@0.1.2"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.10"
    },
    "github:jspm/nodelibs-querystring@0.1.0": {
      "querystring": "npm:querystring@0.2.0"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-string_decoder@0.1.0": {
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "github:jspm/nodelibs-timers@0.1.0": {
      "timers-browserify": "npm:timers-browserify@1.4.2"
    },
    "github:jspm/nodelibs-url@0.1.0": {
      "url": "npm:url@0.10.3"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "github:twbs/bootstrap@3.3.7": {
      "jquery": "npm:jquery@3.2.1"
    },
    "npm:@material/button@0.3.9": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/card@0.2.4": {
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/checkbox@0.4.0": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/dialog@0.3.3": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.1.1",
      "focus-trap": "npm:focus-trap@2.3.0"
    },
    "npm:@material/drawer@0.5.2": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/elevation@0.1.9": {
      "@material/animation": "npm:@material/animation@0.2.3"
    },
    "npm:@material/fab@0.3.11": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/form-field@0.2.9": {
      "@material/base": "npm:@material/base@0.2.2",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/grid-list@0.2.6": {
      "@material/base": "npm:@material/base@0.2.2",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/icon-toggle@0.1.14": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/linear-progress@0.1.4": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/list@0.2.12": {
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/menu@0.4.1": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/radio@0.2.7": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/ripple@0.8.0": {
      "@material/base": "npm:@material/base@0.2.2",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/select@0.3.10": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/list": "npm:@material/list@0.2.12",
      "@material/menu": "npm:@material/menu@0.4.1",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/slider@0.2.0": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/snackbar@0.3.0": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/button": "npm:@material/button@0.3.9",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/switch@0.1.9": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/theme": "npm:@material/theme@0.1.5"
    },
    "npm:@material/tabs@0.2.3": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/textfield@0.3.1": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:@material/toolbar@0.4.2": {
      "@material/base": "npm:@material/base@0.2.2",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/rtl": "npm:@material/rtl@0.1.6",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:asn1.js@4.9.1": {
      "bn.js": "npm:bn.js@4.11.7",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:assert@1.4.1": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "util": "npm:util@0.10.3"
    },
    "npm:aurelia-auth@3.0.5": {
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-event-aggregator": "npm:aurelia-event-aggregator@1.0.1",
      "aurelia-fetch-client": "npm:aurelia-fetch-client@1.1.2",
      "aurelia-router": "npm:aurelia-router@1.3.0"
    },
    "npm:aurelia-binding@1.2.1": {
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0"
    },
    "npm:aurelia-bootstrapper@2.1.1": {
      "aurelia-event-aggregator": "npm:aurelia-event-aggregator@1.0.1",
      "aurelia-framework": "npm:aurelia-framework@1.1.2",
      "aurelia-history": "npm:aurelia-history@1.0.0",
      "aurelia-history-browser": "npm:aurelia-history-browser@1.0.0",
      "aurelia-loader-default": "npm:aurelia-loader-default@1.0.2",
      "aurelia-logging-console": "npm:aurelia-logging-console@1.0.0",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-pal-browser": "npm:aurelia-pal-browser@1.2.1",
      "aurelia-polyfills": "npm:aurelia-polyfills@1.2.1",
      "aurelia-router": "npm:aurelia-router@1.3.0",
      "aurelia-templating": "npm:aurelia-templating@1.4.2",
      "aurelia-templating-binding": "npm:aurelia-templating-binding@1.3.0",
      "aurelia-templating-resources": "npm:aurelia-templating-resources@1.4.0",
      "aurelia-templating-router": "npm:aurelia-templating-router@1.1.0"
    },
    "npm:aurelia-dependency-injection@1.3.1": {
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-event-aggregator@1.0.1": {
      "aurelia-logging": "npm:aurelia-logging@1.3.1"
    },
    "npm:aurelia-framework@1.1.2": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-history-browser@1.0.0": {
      "aurelia-history": "npm:aurelia-history@1.0.0",
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-html-import-template-loader@1.0.0": {
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "webcomponentsjs": "npm:webcomponents.js@0.7.24"
    },
    "npm:aurelia-loader-default@1.0.2": {
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-loader@1.0.0": {
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-path": "npm:aurelia-path@1.1.1"
    },
    "npm:aurelia-logging-console@1.0.0": {
      "aurelia-logging": "npm:aurelia-logging@1.3.1"
    },
    "npm:aurelia-metadata@1.0.3": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-pal-browser@1.2.1": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-polyfills@1.2.1": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-route-recognizer@1.1.0": {
      "aurelia-path": "npm:aurelia-path@1.1.1"
    },
    "npm:aurelia-router@1.3.0": {
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-event-aggregator": "npm:aurelia-event-aggregator@1.0.1",
      "aurelia-history": "npm:aurelia-history@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-route-recognizer": "npm:aurelia-route-recognizer@1.1.0"
    },
    "npm:aurelia-task-queue@1.2.0": {
      "aurelia-pal": "npm:aurelia-pal@1.3.0"
    },
    "npm:aurelia-templating-binding@1.3.0": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-templating-resources@1.4.0": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-templating-router@1.1.0": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-router": "npm:aurelia-router@1.3.0",
      "aurelia-templating": "npm:aurelia-templating@1.4.2"
    },
    "npm:aurelia-templating@1.4.2": {
      "aurelia-binding": "npm:aurelia-binding@1.2.1",
      "aurelia-dependency-injection": "npm:aurelia-dependency-injection@1.3.1",
      "aurelia-loader": "npm:aurelia-loader@1.0.0",
      "aurelia-logging": "npm:aurelia-logging@1.3.1",
      "aurelia-metadata": "npm:aurelia-metadata@1.0.3",
      "aurelia-pal": "npm:aurelia-pal@1.3.0",
      "aurelia-path": "npm:aurelia-path@1.1.1",
      "aurelia-task-queue": "npm:aurelia-task-queue@1.2.0"
    },
    "npm:bn.js@4.11.7": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:browserify-aes@1.0.6": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "buffer-xor": "npm:buffer-xor@1.0.3",
      "cipher-base": "npm:cipher-base@1.0.3",
      "create-hash": "npm:create-hash@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "inherits": "npm:inherits@2.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:browserify-cipher@1.0.0": {
      "browserify-aes": "npm:browserify-aes@1.0.6",
      "browserify-des": "npm:browserify-des@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "evp_bytestokey": "npm:evp_bytestokey@1.0.0"
    },
    "npm:browserify-des@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "cipher-base": "npm:cipher-base@1.0.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "des.js": "npm:des.js@1.0.0",
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:browserify-rsa@4.0.1": {
      "bn.js": "npm:bn.js@4.11.7",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "randombytes": "npm:randombytes@2.0.5"
    },
    "npm:browserify-sign@4.0.4": {
      "bn.js": "npm:bn.js@4.11.7",
      "browserify-rsa": "npm:browserify-rsa@4.0.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "create-hmac": "npm:create-hmac@1.1.6",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@6.4.0",
      "inherits": "npm:inherits@2.0.1",
      "parse-asn1": "npm:parse-asn1@5.1.0",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:buffer-xor@1.0.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:buffer@5.0.6": {
      "base64-js": "npm:base64-js@1.2.1",
      "ieee754": "npm:ieee754@1.1.8"
    },
    "npm:cipher-base@1.0.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "string_decoder": "github:jspm/nodelibs-string_decoder@0.1.0"
    },
    "npm:constants-browserify@0.0.1": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:core-util-is@1.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:create-ecdh@4.0.0": {
      "bn.js": "npm:bn.js@4.11.7",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@6.4.0"
    },
    "npm:create-hash@1.1.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "cipher-base": "npm:cipher-base@1.0.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "ripemd160": "npm:ripemd160@2.0.1",
      "sha.js": "npm:sha.js@2.4.8"
    },
    "npm:create-hmac@1.1.6": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "cipher-base": "npm:cipher-base@1.0.3",
      "create-hash": "npm:create-hash@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "ripemd160": "npm:ripemd160@2.0.1",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "sha.js": "npm:sha.js@2.4.8"
    },
    "npm:crypto-browserify@3.11.0": {
      "browserify-cipher": "npm:browserify-cipher@1.0.0",
      "browserify-sign": "npm:browserify-sign@4.0.4",
      "create-ecdh": "npm:create-ecdh@4.0.0",
      "create-hash": "npm:create-hash@1.1.3",
      "create-hmac": "npm:create-hmac@1.1.6",
      "diffie-hellman": "npm:diffie-hellman@5.0.2",
      "inherits": "npm:inherits@2.0.1",
      "pbkdf2": "npm:pbkdf2@3.0.12",
      "public-encrypt": "npm:public-encrypt@4.0.0",
      "randombytes": "npm:randombytes@2.0.5"
    },
    "npm:des.js@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
    },
    "npm:diffie-hellman@5.0.2": {
      "bn.js": "npm:bn.js@4.11.7",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "miller-rabin": "npm:miller-rabin@4.0.0",
      "randombytes": "npm:randombytes@2.0.5",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:elliptic@6.4.0": {
      "bn.js": "npm:bn.js@4.11.7",
      "brorand": "npm:brorand@1.1.0",
      "hash.js": "npm:hash.js@1.1.2",
      "hmac-drbg": "npm:hmac-drbg@1.0.1",
      "inherits": "npm:inherits@2.0.1",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:evp_bytestokey@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0"
    },
    "npm:focus-trap@2.3.0": {
      "tabbable": "npm:tabbable@1.0.6"
    },
    "npm:hash-base@2.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "inherits": "npm:inherits@2.0.3",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:hash.js@1.1.2": {
      "inherits": "npm:inherits@2.0.3",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
    },
    "npm:hmac-drbg@1.0.1": {
      "hash.js": "npm:hash.js@1.1.2",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:inherits@2.0.3": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:material-components-web@0.15.0": {
      "@material/animation": "npm:@material/animation@0.2.3",
      "@material/auto-init": "npm:@material/auto-init@0.1.2",
      "@material/base": "npm:@material/base@0.2.2",
      "@material/button": "npm:@material/button@0.3.9",
      "@material/card": "npm:@material/card@0.2.4",
      "@material/checkbox": "npm:@material/checkbox@0.4.0",
      "@material/dialog": "npm:@material/dialog@0.3.3",
      "@material/drawer": "npm:@material/drawer@0.5.2",
      "@material/elevation": "npm:@material/elevation@0.1.9",
      "@material/fab": "npm:@material/fab@0.3.11",
      "@material/form-field": "npm:@material/form-field@0.2.9",
      "@material/grid-list": "npm:@material/grid-list@0.2.6",
      "@material/icon-toggle": "npm:@material/icon-toggle@0.1.14",
      "@material/layout-grid": "npm:@material/layout-grid@0.4.0",
      "@material/linear-progress": "npm:@material/linear-progress@0.1.4",
      "@material/list": "npm:@material/list@0.2.12",
      "@material/menu": "npm:@material/menu@0.4.1",
      "@material/radio": "npm:@material/radio@0.2.7",
      "@material/ripple": "npm:@material/ripple@0.8.0",
      "@material/select": "npm:@material/select@0.3.10",
      "@material/slider": "npm:@material/slider@0.2.0",
      "@material/snackbar": "npm:@material/snackbar@0.3.0",
      "@material/switch": "npm:@material/switch@0.1.9",
      "@material/tabs": "npm:@material/tabs@0.2.3",
      "@material/textfield": "npm:@material/textfield@0.3.1",
      "@material/theme": "npm:@material/theme@0.1.5",
      "@material/toolbar": "npm:@material/toolbar@0.4.2",
      "@material/typography": "npm:@material/typography@0.2.2"
    },
    "npm:miller-rabin@4.0.0": {
      "bn.js": "npm:bn.js@4.11.7",
      "brorand": "npm:brorand@1.1.0"
    },
    "npm:numeral@2.0.6": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:os-browserify@0.1.2": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:parse-asn1@5.1.0": {
      "asn1.js": "npm:asn1.js@4.9.1",
      "browserify-aes": "npm:browserify-aes@1.0.6",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
      "pbkdf2": "npm:pbkdf2@3.0.12",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:pbkdf2@3.0.12": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "create-hmac": "npm:create-hmac@1.1.6",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "ripemd160": "npm:ripemd160@2.0.1",
      "safe-buffer": "npm:safe-buffer@5.1.1",
      "sha.js": "npm:sha.js@2.4.8"
    },
    "npm:process@0.11.10": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:public-encrypt@4.0.0": {
      "bn.js": "npm:bn.js@4.11.7",
      "browserify-rsa": "npm:browserify-rsa@4.0.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "create-hash": "npm:create-hash@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "parse-asn1": "npm:parse-asn1@5.1.0",
      "randombytes": "npm:randombytes@2.0.5"
    },
    "npm:punycode@1.3.2": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:randombytes@2.0.5": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "safe-buffer": "npm:safe-buffer@5.1.1"
    },
    "npm:readable-stream@1.1.14": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "core-util-is": "npm:core-util-is@1.0.2",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream-browserify": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "npm:ripemd160@2.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "hash-base": "npm:hash-base@2.0.2",
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:safe-buffer@5.1.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:sha.js@2.4.8": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:source-map-support@0.4.15": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.1",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "module": "github:jspm/nodelibs-module@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "querystring": "github:jspm/nodelibs-querystring@0.1.0",
      "source-map": "npm:source-map@0.5.6"
    },
    "npm:source-map@0.5.6": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.1.14"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.1"
    },
    "npm:timers-browserify@1.4.2": {
      "process": "npm:process@0.11.10"
    },
    "npm:typescript@2.4.1": {
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "net": "github:jspm/nodelibs-net@0.1.2",
      "os": "github:jspm/nodelibs-os@0.1.0",
      "source-map-support": "npm:source-map-support@0.4.15"
    },
    "npm:url@0.10.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "punycode": "npm:punycode@1.3.2",
      "querystring": "npm:querystring@0.2.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    },
    "npm:webcomponents.js@0.7.24": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});

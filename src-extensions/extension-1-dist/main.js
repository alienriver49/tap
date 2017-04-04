var Extension1;
(function (Extension1) {
    var Main = (function () {
        function Main() {
        }
        Main.initialize = function () {
            console.log('Extension-1 Initializing.');
            setTimeout(function () {
                TapFx.Rpc.EventBus.getDefault().publish('extension.new-blade', {
                    extensionName: 'Hello There Shell, this is Extension 1.'
                });
                //subscription.unsubscribe();
            }, 2000);
        };
        return Main;
    }());
    Main.initialize();
})(Extension1 || (Extension1 = {}));

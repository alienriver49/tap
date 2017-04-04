module Extension1 {
    declare const TapFx;

    class Main {
        constructor() { }

        static initialize() {
            console.log('Extension-1 Initializing.');

            setTimeout(function () {
                TapFx.Rpc.EventBus.getDefault().publish('extension.new-blade', {
                    extensionName: 'Hello There Shell, this is Extension 1.'
                });
                //subscription.unsubscribe();
            }, 2000);
        }
    }

    Main.initialize();
}
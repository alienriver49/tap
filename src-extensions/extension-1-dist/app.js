// export class EntryPoint {
//     constructor() { }
//     static initialize() {
//         // console.log('Extension-1 Initializing.');
//         // setTimeout(function () {
//         //     TapFx.Rpc.EventBus.getDefault().publish('extension.new-blade', {
//         //         extensionName: 'Hello There Shell, this is Extension 1.'
//         //     });
//         //     //subscription.unsubscribe();
//         // }, 2000);
//     }
//}
(function () {
    window.create = function () {
        return new Extension1.MainBlade();
    };
})();

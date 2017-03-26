(() => {
    console.log('Extension-1 Initializing.');

    setTimeout(function () {
        window.EventBus.getDefault().publish('extension.new-blade', {
            extensionName: 'Hello There Shell, this is Extension 1.'
        });
        //subscription.unsubscribe();
    }, 2000);
})();
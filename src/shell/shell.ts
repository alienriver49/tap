declare var TapFx;

interface IExtensionLoadingInfo {
    id: string;
    files: string[];
}

export class Shell {
    constructor() { }

    private _subscriptions: any = [];

    private fakeExtension1Load(): IExtensionLoadingInfo {
        let extensionLoadingInfo = {
            id: 'extension-1',
            files: [
                // load TapFx scripts
                './src/tap-fx-dist/tap-rpc/event-bus.js',
                './src/tap-fx-dist/tap-ux/view-models/view-models.blade.js',

                // load extension scripts
                './src-extensions/extension-1-dist/main-blade.js',
                './src-extensions/extension-1-dist/app.js',
            ]
        }
        return extensionLoadingInfo;
    }

    private interceptModelUpdate(method, update, value) {
        console.log('THE UPDATED VALUE IS', value);
        update(value);
        // if (value && (value as string).toLowerCase() === 'are you getting this?') {
        //     (document.querySelector('#sheath-1') as HTMLIFrameElement).contentWindow.postMessage({
        //         value: value
        //     }, 'http://localhost:9000/');
        // }
    }

    private handleNewBladeMessage(message: any): void {
        console.log('SHELL', 'RECEIVE', 'extension.new-blade', message);
    }

    extensions: string[] = [];

    activate(params, routeConfig) {
        console.log('SHELL: activate');
        this.registerEventBus();
    }

    loadExtension(id: string): void {
        let extensionLoadingInfo: IExtensionLoadingInfo;

        switch (id) {
            case '1':
                extensionLoadingInfo = this.fakeExtension1Load();
                break;

            default: throw new Error('Unknow extension ID specified.');
        }

        let iFrame = document.createElement('iframe');

        document.querySelector('#extension-iframes').appendChild(iFrame);

        extensionLoadingInfo.files.forEach((filePath) => {
            let scriptTag = iFrame.contentWindow.document.createElement('script');
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('src', filePath);

            iFrame.contentWindow.document.body.appendChild(scriptTag);
        });

        iFrame.setAttribute('id', extensionLoadingInfo.id);
        iFrame.setAttribute('src', 'about:blank');
        iFrame.setAttribute('sandbox', '');

        this.extensions.push(extensionLoadingInfo.id);

        setTimeout(() => {
            var vm = (iFrame.contentWindow as any).create();
            console.log('...and the VM is: ', vm);
            vm.onInitialize();
        }, 1000);
    }

    unloadExtension(id: string): void {
    }

    registerEventBus(): void {
        this._subscriptions.push(TapFx.Rpc.EventBus.getDefault().subscribe('extension.new-blade', this.handleNewBladeMessage));
    }

    unregisterEventBus(): void {
        while (this._subscriptions.length) {
            this._subscriptions.pop().unsubscribe();
        }
    }
}
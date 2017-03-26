import { IExtensionLoadingInfo } from './../models/IExtensionLoadingInfo'
import { EventBus } from './../tap-fx/event-bus'

export class Shell {
    constructor() { }

    private readonly BASE_URL = 'src/'

    private _subscriptions: any = [];

    private fakeExtension1Load(): IExtensionLoadingInfo {
        let extensionLoadingInfo = {
            id: 'extension-1',
            files: [
                `${this.BASE_URL}/extensions/extension-1/event-bus.js`,
                `${this.BASE_URL}/extensions/extension-1/main.js`,
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
        iFrame.setAttribute('id', extensionLoadingInfo.id);
        iFrame.setAttribute('src', 'about:blank');

        document.querySelector('#extension-iframes').appendChild(iFrame);

        extensionLoadingInfo.files.forEach((filePath) => {
            let scriptTag = iFrame.contentWindow.document.createElement('script');
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('src', filePath);

            iFrame.contentWindow.document.body.appendChild(scriptTag);
        });

        this.extensions.push(extensionLoadingInfo.id);
    }

    unloadExtension(id: string): void {
    }

    registerEventBus(): void {
        this._subscriptions.push(EventBus.getDefault().subscribe('extension.new-blade', this.handleNewBladeMessage));
    }

    unregisterEventBus(): void {
        while (this._subscriptions.length) {
            this._subscriptions.pop().unsubscribe();
        }
    }
}
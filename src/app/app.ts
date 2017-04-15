interface IExtensionLoadingInfo {
    id: string;
    files: string[];
}

export class App {
    constructor() { }

    private _subscriptions: any = [];

    private fakeExtension1Load(): IExtensionLoadingInfo {
        let extensionLoadingInfo = {
            id: 'extension-1',
            files: [
                'dist-tap-fx/tap-fx-bundle.js',
                'dist-tap-extensions/extension-1/extension-1-bundle.js',
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

    extensions: string[] = [];

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

        iFrame.setAttribute('sandbox', '');

        this.extensions.push(extensionLoadingInfo.id);
    }
}
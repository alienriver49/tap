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
                'vendor-bundle.js',
                'tapFx-bundle.js',
                'tapExt1-bundle.js',
            ]
        }
        return extensionLoadingInfo;
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

        let iFramesEl = document.querySelector('#extension-iframes');
        if (iFramesEl) {
            iFramesEl.appendChild(iFrame);
        }

        setTimeout(() => {
            console.log('loading vendor...');
            let scriptTag = iFrame.contentWindow.document.createElement('script');
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('src', 'vendor-bundle.js');
            iFrame.contentWindow.document.body.appendChild(scriptTag);
        }, 1000);

        setTimeout(() => {
            console.log('loading tapFx...');
            let scriptTag = iFrame.contentWindow.document.createElement('script');
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('src', 'tapFx-bundle.js');
            iFrame.contentWindow.document.body.appendChild(scriptTag);
        }, 3000);

        setTimeout(() => {
            console.log('loading tapExtension1...');
            let scriptTag = iFrame.contentWindow.document.createElement('script');
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('src', 'tapExt1-bundle.js');
            iFrame.contentWindow.document.body.appendChild(scriptTag);
        }, 5000);

        // extensionLoadingInfo.files.forEach((filePath) => {
        //     let scriptTag = iFrame.contentWindow.document.createElement('script');
        //     scriptTag.setAttribute('type', 'text/javascript');
        //     scriptTag.setAttribute('src', filePath);

        //     iFrame.contentWindow.document.body.appendChild(scriptTag);
        // });

        iFrame.setAttribute('sandbox', '');

        this.extensions.push(extensionLoadingInfo.id);
    }
}
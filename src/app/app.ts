export class App {
    constructor() { }

    private _subscriptions: any = [];

    extensions: string[] = [];

    loadExtension(id: string): void {
        let extensionScripts = [
            'common-bundle.js',
            'tapFx-bundle.js'
        ];

        switch (id) {
            case '1':
                extensionScripts.push('tapExt1-bundle.js');
                break;

            default: throw new Error('Unknow extension ID specified.');
        }

        let iFrame = document.createElement('iframe');
        iFrame.setAttribute('id', id);
        iFrame.setAttribute('src', 'about:blank');

        let iFramesEl = document.querySelector('#extension-iframes');
        if (iFramesEl) {
            iFramesEl.appendChild(iFrame);
        }

        extensionScripts.forEach((script: string, index: number) => {
            // temp fix: loading every second so that there is enough time for scripts to load
            setTimeout(() => {
                console.log('Loading:', script);
                let scriptTag = iFrame.contentWindow.document.createElement('script');
                scriptTag.setAttribute('type', 'text/javascript');
                scriptTag.setAttribute('src', script);
                iFrame.contentWindow.document.body.appendChild(scriptTag);
            }, 1000 * index);
        });

        iFrame.setAttribute('sandbox', '');

        this.extensions.push(id);
    }
}
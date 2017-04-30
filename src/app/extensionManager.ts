import { inject, Factory } from 'aurelia-framework'
import Extension from './extension'

@inject(Factory.of(Extension))
class ExtensionManager {
    constructor(private _extensionFactory: (...args: any[]) => Extension) {
        let subscription = window.TapFx.Rpc.subscribe('tapfx.newBlade', this._onNewBlade.bind(this));
        this._rpcSubscriptions.push(subscription);
    }

    private _rpcSubscriptions: any[] = [];

    private _onNewBlade(data: any): void {
        console.log('[SHELL] Received newBlade message: ', data);
        this.extensions[0].addBlade(data.bladeId, data.serializedBlade);
    }

    extensions: Extension[] = [];

    loadExtension(id: number): Promise<string> {
        return new Promise<string>((resolve) => {
            let extensionScripts = [
                'common-bundle.js',
                'tapFx-bundle.js'
            ];

            switch (id) {
                case 1:
                    extensionScripts.push('tapExt1-bundle.js');
                    break;
                default: throw new Error('Unknow extension ID specified.');
            }

            let extensionID = window.TapFx.Utilities.newGuid();

            let iFrame = document.createElement('iframe');
            iFrame.setAttribute('id', extensionID);
            iFrame.setAttribute('src', 'about:blank');

            let iFramesEl = document.querySelector('#extension-iframes');
            if (iFramesEl) {
                iFramesEl.appendChild(iFrame);
            }

            iFrame.setAttribute('sandbox', '');

            extensionScripts.forEach((script: string, index: number, array: string[]) => {
                // temp fix: loading every second so that there is enough time for scripts to load
                setTimeout(() => {
                    console.log('[SHELL] Loading:', script);
                    let scriptTag = iFrame.contentWindow.document.createElement('script');
                    scriptTag.setAttribute('type', 'text/javascript');
                    scriptTag.setAttribute('src', script);
                    iFrame.contentWindow.document.body.appendChild(scriptTag);

                    if (index === array.length - 1) {
                        this.extensions.push(this._extensionFactory(extensionID));
                        resolve(extensionID);
                    }
                }, 1000 * index);
            });
        });
    }
}

export default ExtensionManager;
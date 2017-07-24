import { inject } from 'aurelia-framework'

interface IScript {
    src?: string;
    inline?: string;
}

@inject('TapFx')
class ExtensionLoaderEngine {
    constructor(
        private _tapFx: ITapFx,
    ) {
    }

    /**
     * Function for getting an extension JS bundle based on convention and the IIS file layout.
     * @param extensionName 
     */
    private _getExtensionBundle(extensionName: string): string {
        return 'exts/tap' + this._tapFx.Utilities.upperCaseFirstChar(extensionName) + '/bootstrap';
    }

    /**
     * Load an extension.
     * @param extensionId The id of the extension to load.
     * @param extensionName The name of the extension to load.
     */
    public loadExtension(extensionId: string, extensionName: string): Promise<string> {
        return new Promise<string>((resolve) => {
            // standard script bundles
            /*
            <!--build:systemjs-->
            <script src="jspm_packages/system.js"></script>
            <script src="system.config.js"></script>
            <!--endbuild-->
            <script>
            System.import('aurelia-bootstrapper');
            </script>*/
            let extScript = this._getExtensionBundle(extensionName);
            let extensionScripts: IScript[] = [
                {src: 'jspm_packages/system.js'},
                {src: 'system.config.js'},
                {inline: 'System.import("'+extScript+'")'}
            ];

            // create an iframe element for the extension
            let iFrame = document.createElement('iframe');
            iFrame.setAttribute('id', extensionId);
            iFrame.setAttribute('src', 'about:blank');
            //iFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
            // function to bootstrap extension scripts. note: should add functionality for async scripts which can be loaded simultaneously
            let bootstrapScripts = (scripts: IScript[]) => {
                // grab the first script from the array, this removes it from the array as well
                let script = scripts.shift();
                if (script) {
                    // if we have a script, set up the tag and add a load listener to recall bootstrapScripts (for the next script)
                    console.log('[SHELL] Loading:', script);
                    let scriptTag = iFrame.contentWindow.document.createElement('script');
                    scriptTag.setAttribute('type', 'text/javascript');
                    if (script.src)
                        scriptTag.setAttribute('src', script.src);
                    if (script.inline)
                        scriptTag.textContent = script.inline;

                    // set up the funcs we will use for handling the load and error events from the script tags
                    let onScriptLoad: EventListener = (e: Event): void => {
                        scriptTag.removeEventListener('load', onScriptLoad);
                        scriptTag.removeEventListener('error', onScriptError);
                        bootstrapScripts(scripts);
                    };
                    let onScriptError: EventListener = (e: Event): void => {
                        // TODO: implement error handling for scripts failing to load
                    };
                    scriptTag.addEventListener('load', onScriptLoad);
                    scriptTag.addEventListener('error', onScriptError);

                    iFrame.contentWindow.document.body.appendChild(scriptTag);

                    setTimeout(() => {
                        bootstrapScripts(scripts);
                    }, 10);
                    //bootstrapScripts(scripts);
                } else {
                    // else, we have no more scripts to load and are finished, so resolve our promise
                    console.log('[SHELL] Finish loading extension: ' + extensionName + ' with (ID): ', extensionId);
                    resolve('finished');
                }
            };
            
            // append that iframe to our 'extension-iframes' element
            let iFramesEl = window.document.getElementById('extension-iframes');
            if (iFramesEl) {
                iFramesEl.appendChild(iFrame);
            }

            
            // Need a base tag so that baseURI is available for SystemJS
            let baseTag = iFrame.contentWindow.document.createElement('base');
            console.log(window.location.href );
            baseTag.setAttribute('href', 'http://falppdt-bjackso.corp.tylertechnologies.com:9000/')
            iFrame.contentWindow.document.head.appendChild(baseTag);

            bootstrapScripts(extensionScripts);
        });
    }

    /**
     * Unload an extension. Removes the iframe of the extension.
     * @param extension 
     */
    public unloadExtension(extensionId: string): void {
        // remove the iframe element
        var iFrameElement = document.getElementById(extensionId);
        if (iFrameElement) iFrameElement.remove();
    }
}

export default ExtensionLoaderEngine;
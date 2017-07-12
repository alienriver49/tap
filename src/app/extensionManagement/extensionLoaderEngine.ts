class ExtensionLoaderEngine {
    constructor(
    ) {
    }

    /**
     * Function for getting an extension JS bundle based on convention and the IIS file layout.
     * @param extensionName 
     */
    private _getExtensionBundle(extensionName: string): string {
        return 'tap' + window.TapFx.Utilities.upperCaseFirstChar(extensionName) + '-bundle.js';
    }

    /**
     * Load an extension.
     * @param extensionId The id of the extension to load.
     * @param extensionName The name of the extension to load.
     */
    public loadExtension(extensionId: string, extensionName: string): Promise<string> {
        return new Promise<string>((resolve) => {
            // standard script bundles
            let extensionScripts = [
                'common-bundle.js',
                'tapFx-bundle.js',
                this._getExtensionBundle(extensionName)
            ];

            // create an iframe element for the extension
            let iFrame = document.createElement('iframe');
            iFrame.setAttribute('id', extensionId);
            iFrame.setAttribute('src', 'about:blank');
            //iFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
            // function to bootstrap extension scripts. note: should add functionality for async scripts which can be loaded simultaneously
            let bootstrapScripts = (scripts: string[]) => {
                // grab the first script from the array, this removes it from the array as well
                let script = scripts.shift();
                if (script) {
                    // if we have a script, set up the tag and add a load listener to recall bootstrapScripts (for the next script)
                    console.log('[SHELL] Loading:', script);
                    let scriptTag = iFrame.contentWindow.document.createElement('script');
                    scriptTag.setAttribute('type', 'text/javascript');
                    scriptTag.setAttribute('src', script);

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
                } else {
                    // else, we have no more scripts to load and are finished, so resolve our promise
                    console.log('[SHELL] Finish loading extension: ' + extensionName + ' with (ID): ', extensionId);
                    resolve('finished');
                }
            };

            // add an event listener to the iframe to load the scripts on load of the iframe element (not sure this is completely necessary)
            let onIFrameLoad: EventListener = (e: Event): void => {
                iFrame.removeEventListener('load', onIFrameLoad);
                bootstrapScripts(extensionScripts);
            };
            iFrame.addEventListener('load', onIFrameLoad, false);
            
            // append that iframe to our 'extension-iframes' element
            let iFramesEl = document.getElementById('extension-iframes');
            if (iFramesEl) {
                iFramesEl.appendChild(iFrame);
            }
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
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
     * Function for getting an extension's SystemJS bootstrap script.
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
                    // if using src, set the src attribute on the script tag, otherwise if using inline, set the textContent on the script tag
                    if (script.src) {
                        scriptTag.setAttribute('src', script.src);

                        // scripts with src will be the only one's which hit load listeners
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
                    } else if (script.inline)
                        scriptTag.textContent = script.inline;

                    iFrame.contentWindow.document.body.appendChild(scriptTag);

                    // since inline doesn't have the load listener to kick of bootstrapping of the scripts, trigger that here
                    if (script.inline) bootstrapScripts(scripts);
                } else {
                    // else, we have no more scripts to load and are finished, so resolve our promise
                    console.log('[SHELL] Finish loading extension: ' + extensionName + ' with (ID): ', extensionId);
                    resolve('finished');
                }
            };

            // add an event listener to the iframe to add a base tag and start loading the scripts on load of the iframe element
            let onIFrameLoad: EventListener = (e: Event): void => {
                iFrame.removeEventListener('load', onIFrameLoad);

                // need a base tag so that baseURI is available for SystemJS
                let baseTag = iFrame.contentWindow.document.createElement('base');
                baseTag.setAttribute('href', this._tapFx.Utilities.currentUrl())
                iFrame.contentWindow.document.head.appendChild(baseTag);

                // start the loading of scripts
                bootstrapScripts(extensionScripts);
            };
            iFrame.addEventListener('load', onIFrameLoad);
            
            // append that iframe to our 'extension-iframes' element
            let iFramesEl = window.document.getElementById('extension-iframes');
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
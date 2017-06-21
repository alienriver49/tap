import { inject, PLATFORM, Aurelia} from 'aurelia-framework';
import Extension from './extension'; // type only
import ConventionEngine from './conventionEngine';
import {Container, Factory} from 'aurelia-dependency-injection';
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {BindingLanguage, ViewSlot, ViewFactory, ViewResources, TemplatingEngine, CompositionTransaction, CompositionEngine, View, CompositionContext, ViewCompiler, ViewCompileInstruction } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {TextTemplateLoader, DefaultLoader} from 'aurelia-loader-default'
import {HTMLImportTemplateLoader} from 'aurelia-html-import-template-loader'

@inject(Loader, Container, CompositionEngine, ViewResources, TextTemplateLoader, ConventionEngine)
class ExtensionLoaderEngine {
    constructor(
        private _defaultLoader: DefaultLoader,
        private _container: Container,
        private _compositionEngine: CompositionEngine,
        private _viewResources: ViewResources,
        private _textTemplateLoader: TextTemplateLoader,
        private _conventionEngine: ConventionEngine,
    ) {
        this._defaultLoader = _defaultLoader || new PLATFORM.Loader();
        this._container = _container || (new Container()).makeGlobal();
        this._viewResources = _viewResources || new ViewResources();
	    this._container.registerSingleton(TemplatingBindingLanguage, TemplatingBindingLanguage);
    }

    private _htmlImportTemplateLoader: HTMLImportTemplateLoader;

    /**
     * Function for getting an extension JS bundle based on convention and the IIS file layout.
     * @param extensionName 
     */
    private getExtensionBundle(extensionName: string): string {
        return 'tap' + window.TapFx.Utilities.upperCaseFirstChar(extensionName) + '-bundle.js';
    }

    /**
     * Load an extension.
     * @param extensionName The name of the extension to load.
     */
    public loadExtension(extensionName: string): Promise<string> {
        return new Promise<string>((resolve) => {
            // standard script bundles
            let extensionScripts = [
                'common-bundle.js',
                'tapFx-bundle.js',
                this.getExtensionBundle(extensionName)
            ];

            // get a new extension id
            let extensionID = window.TapFx.Utilities.newGuid();

            // create an iframe element for the extension
            let iFrame = document.createElement('iframe');
            iFrame.setAttribute('id', extensionID);
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
                    scriptTag.addEventListener('load', (e) => {
                        bootstrapScripts(scripts);
                    });

                    iFrame.contentWindow.document.body.appendChild(scriptTag);
                } else {
                    // else, we have no more scripts to load and are finished, so resolve our promise
                    console.log('[SHELL] Finish loading extension: ' + extensionName + ' with (ID): ', extensionID);
                    resolve(extensionID);
                }
            };
            // add an event listener to the iframe to load the scripts on load of the iframe element (not sure this is completely necessary)
            iFrame.addEventListener('load', (e) => {
                bootstrapScripts(extensionScripts);
            }, false);
            
            // append that iframe to our 'extension-iframes' element
            let iFramesEl = document.getElementById('extension-iframes');
            if (iFramesEl) {
                iFramesEl.appendChild(iFrame);
            }
        });
    }

    /**
     * For the passed view, check if any cached ViewFactories exist for it.
     * If so, use the cached ViewFactory and bind it to the passed viewModel and 
     * append it to the DOM
     * If not, load the view via HTML Import and create and cache the ViewFactory,
     * then bind it to passed view model and append it to the DOM
     * @param extension The extension associated with the viewName and viewModel
     * @param viewName Name of the view to load 
     * @param viewModel Viewmodel object to bind to the view
     */
    public addView(extension: Extension, viewName: string, viewModel: object, functions: string[]): void {
        console.log('[SHELL] addView: ');
        // Assume we get the directory based on the Extension routing
        let viewPath = extension.name + "/"; 
        let viewWithPath = `${viewPath}${viewName}`;
        // Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+extension.id;
        let queryBaseElement = document.querySelector(elementSelector);
        if (queryBaseElement) {
            let baseElement = queryBaseElement

            let cachedViewFactory = this._container.get(viewWithPath);
            if (typeof cachedViewFactory === "string") {
                // Don't have a viewfactory for this view yet, so import, compile and cache it
                // The container.get call creates a resolver for the key if it can't find any matches,
                // but the resolver just returns the key string, so remove it
                this._container.unregister(viewWithPath);

                this._htmlImportTemplateLoader = this._htmlImportTemplateLoader || new HTMLImportTemplateLoader("");
                // extension passes the name of the main blade view
                let templateRegistryEntry = new TemplateRegistryEntry(viewName); 
                //let loader = new WebpackLoader();
                let loader = this._defaultLoader;
                loader.useTemplateLoader(this._htmlImportTemplateLoader);

                loader.loadTemplate(viewWithPath).then((templateRegistryEntry) => {
                    if (templateRegistryEntry.template) {
                        // Delete the link element, otherwise if this blade/view is re-imported, the compiler will fail because it will
                        // be a duplicate link element
                        // Don't really need to delete it anymore since we're using cached viewFactories, but doesn't hurt to clean up
                        let linkToDelete = document.querySelector(`link[rel="import"][href="${viewPath}${viewName}"]`);
                        if (linkToDelete)
                            linkToDelete.remove();

                        // attempt to attach conventions before compiling the view
                        let docFragment = (templateRegistryEntry.template as HTMLTemplateElement).content;
                        if (functions.length > 0) this._conventionEngine.attachFunctions(docFragment, functions);

                        //(baseElement as Element).appendChild((templateRegistryEntry.template as HTMLTemplateElement).content.cloneNode(true));
                        this._viewResources = new ViewResources(this._viewResources, viewPath + viewName);
                        this._viewResources.bindingLanguage = this._container.get(BindingLanguage);
                        let viewCompiler = new ViewCompiler(this._container.get(BindingLanguage) as BindingLanguage, this._viewResources)
                        let viewFactory = viewCompiler.compile(templateRegistryEntry.template, this._viewResources, ViewCompileInstruction.normal);
                        this._container.registerInstance(viewWithPath, viewFactory); 
                        let view = viewFactory.create(this._container, undefined, baseElement);
                        console.log('[SHELL] addView: created view', );
                        view.appendNodesTo(baseElement);
                        view.bind(viewModel);
                    }
                });
            }

            if (cachedViewFactory.constructor.name === "ViewFactory") {
                let view = cachedViewFactory.create(this._container, undefined, baseElement);
                console.log('[SHELL] addView: created view (cached)', );
                view.appendNodesTo(baseElement);
                view.bind(viewModel);
            }

        }
    }

    /**
     * Deprecated
     * Loads the view from the serialized html and binds to the passed viewmodel
     * @param content 
     * @param viewModel 
     */
    /*private addView2(content: string, viewModel: object): void {
        console.log('[SHELL] addView2: ', content);
        //Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this.id;
        let baseElement = document.querySelector(elementSelector);
        //content = '<template> <div> <label for="title"><strong>Title:</strong></label> <input type="text" value.bind="title" /> </div> <br /> <div> <label for="subtitle"><strong>Subtitle:</strong></label> <input type="text" value.bind="subtitle & updateTrigger:\'blur\'" /> </div> <br /> <div> <label for="subtitle"><strong>Display:</strong></label> <span>${display}</span> </div> </template>';
        if (baseElement){
            //let vSlot = new ViewSlot(baseElement, true);
            this._viewResources = new ViewResources(this._viewResources);
            this._viewResources.bindingLanguage = this._container.get(BindingLanguage);
            let viewCompiler = new ViewCompiler(this._container.get(BindingLanguage) as BindingLanguage, this._viewResources)
            let viewFactory = viewCompiler.compile(content, this._viewResources, ViewCompileInstruction.normal);
            let view = viewFactory.create(this._container, undefined, baseElement);
            console.log('[SHELL] addView2: created view', );
            view.appendNodesTo(baseElement);
            view.bind(viewModel);

            // Test loading an html file via a link element
            let link = document.createElement('link');
            link.rel = "import";
            link.href = "Ext1/landingBlade.html";
            link.onload = (e) => {
                console.log("import loaded");
                var link = (document.querySelector('link[rel="import"]') as HTMLLinkElement);
                if (link && link.import){
                    var template = (link.import as Document).querySelector('template');
                    if (template){
                        //(baseElement as Element).appendChild(template.content.cloneNode(true));
                    }
                }
            };
            document.head.appendChild(link);
            console.log('[SHELL] addView2: view binding done', );*/
            /*
            this.instruction = {
                container: this.container,
                viewResources: this.viewResources,
                bindingContext: Extension.bindingContext,
                overrideContext: Extension.overrideContext,
                viewSlot: vSlot,
                viewModel: viewModel,
                host: baseElement 
            };
            console.log('[EXT] composing: ');
            this.compositionEngine.compose(this.instruction).then(controller => {
                    console.log('[EXT] composed: ');
                    vSlot.bind(Extension.bindingContext, Extension.overrideContext);
                    vSlot.attached();
            });
            */
        /*}
    }*/
}

export default ExtensionLoaderEngine;
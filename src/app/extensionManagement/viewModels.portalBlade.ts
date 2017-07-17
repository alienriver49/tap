import { inject, PLATFORM, Aurelia} from 'aurelia-framework';
import {IExtensionResources, Extension } from './extension';
import {Container, Factory} from 'aurelia-dependency-injection';
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {BindingLanguage, TemplateRegistryViewStrategy, ViewEngine, ViewSlot, ViewLocator, ViewFactory, ViewResources, TemplatingEngine, CompositionTransaction, CompositionEngine, View, CompositionContext, ViewCompiler, ViewCompileInstruction } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {TextTemplateLoader, DefaultLoader} from 'aurelia-loader-default'
import {HTMLImportTemplateLoader} from 'aurelia-html-import-template-loader'

let tapFx = window.TapFx;

export interface IPortalBladeConfig {
    bladeId: string;
    serializedBlade: Object;
    viewName: string;
    serializedView: string,
    functions: string[]
}

export class PortalBlade extends tapFx.ViewModels.BaseBlade {
    constructor(
        private _extension: Extension,
        private _config: IPortalBladeConfig
    ) { 
        super();
        this._extensionResources = _extension.getResources();
        // set this from the config
        this.bladeId = _config.bladeId;
    }

    private _extensionResources: IExtensionResources;
    /**
     * The blade's view. Stored for removal.
     * @internal
     */
    private _view: View;
    /**
     * The blade's id, set via the config.
     * @readonly
     */
    public readonly bladeId: string;

    /**
     * For the blade viewName, check if any cached ViewFactories exist for it.
     * If so, use the cached ViewFactory and bind it to the passed viewModel and 
     * append it to the DOM
     * If not, load the view via HTML Import and create and cache the ViewFactory,
     * then bind it to passed view model and append it to the DOM
     */
    public addView(): void {
        // Assume we get the directory based on the Extension routing
        let viewPath = this._extension.name + "/"; 
        let viewWithPath = `${viewPath}${this._config.viewName}`;
        console.log('[SHELL] addView, loading ', viewWithPath);

        // Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this._extension.id;
        let queryBaseElement = document.querySelector(elementSelector);
        if (!queryBaseElement){
            throw Error(`Can't find element matching selector: ${elementSelector}`);
        }

        let baseElement = queryBaseElement

        let loader = this._extensionResources.defaultLoader;
        let cachedTemplateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(viewWithPath);
        if (!cachedTemplateRegistryEntry || !cachedTemplateRegistryEntry.factory){
            // Use the HTML Import loader
            loader.useTemplateLoader(this._extensionResources.htmlImportLoader);

            // The loader caches templateRegistryEntries in its templateRegistry,
            loader.loadTemplate(viewWithPath).then((templateRegistryEntry) => {
                loader.useTemplateLoader(this._extensionResources.textTemplateLoader);
                // the loadTemplate call automatically creates a resolver for the view in the global container
                // But the resolver just returns the view string, so we don't want to keep it, so try to remove it
                // if (this._extensionResources.container.parent && this._extensionResources.container.parent.get(viewWithPath))
                //     this._extensionResources.container.parent.unregister(viewWithPath);

                if (templateRegistryEntry.template) {
                    // Delete the link element, otherwise if this blade/view is re-imported, the compiler will fail because it will
                    // be a duplicate link element
                    // Don't really need to delete it anymore since we're using cached viewFactories, but doesn't hurt to clean up
                    let linkToDelete = document.querySelector(`link[rel="import"][href="${viewPath}${this._config.viewName}"]`);
                    if (linkToDelete)
                        linkToDelete.remove();

                    // attempt to attach conventions before compiling the view
                    let docFragment = (templateRegistryEntry.template as HTMLTemplateElement).content;
                    if (this._config.functions.length > 0) tapFx.ConventionEngine.attachFunctions(docFragment, this._config.functions);

                    // this._viewEngine.importViewResources(["webComponents/tapComponents/tap-test-component"], ["tap-test-component"], this._viewResources).then((viewResources) => {
                    //     var dmf = viewResources;
                    //     var dmf1 = loader;
                    //     var dmf2 = this._viewEngine;
                    // })

                    // loader.useTemplateLoader(this._textTemplateLoader);
                    // this._viewEngine.loadTemplateResources(templateRegistryEntry).then((viewResources) => {
                    //     let dmf = viewResources;
                    //     let dmf1 = this;
                    //     //this._viewResources = new ViewResources(this._viewResources, viewPath + viewName);
                    //     viewResources.bindingLanguage = this._container.get(BindingLanguage);
                    //     let viewCompiler = new ViewCompiler(this._container.get(BindingLanguage) as BindingLanguage, viewResources)
                    //     let viewFactory = viewCompiler.compile(templateRegistryEntry.template, viewResources, ViewCompileInstruction.normal);
                    //     this._container.registerInstance(viewWithPath, viewFactory); 
                    //     let view = viewFactory.create(this._container, undefined, baseElement);
                    //     console.log('[SHELL] addView: created view', );
                    //     view.appendNodesTo(baseElement);
                    //     view.bind(viewModel);
                    // })

                    // Get associated viewFactory for template, otherwise create it and attach to templateRegistryEntry
                    let viewFactory = templateRegistryEntry.factory;
                    if (!viewFactory){
                        this._extensionResources.viewResources = new ViewResources(this._extensionResources.viewResources, templateRegistryEntry.address);
                        this._extensionResources.viewResources.bindingLanguage = this._extensionResources.container.get(TemplatingBindingLanguage);
                        let viewCompiler = new ViewCompiler(this._extensionResources.container.get(TemplatingBindingLanguage) as BindingLanguage, this._extensionResources.viewResources)
                        viewFactory = viewCompiler.compile(templateRegistryEntry.template, this._extensionResources.viewResources, ViewCompileInstruction.normal);
                        templateRegistryEntry.factory = viewFactory;
                    }
                    this._createBindView(viewFactory, baseElement);
                }
            });
        }else{
            let viewFactory = cachedTemplateRegistryEntry.factory;
            this._createBindView(viewFactory, baseElement);
        }
    }

    /**
     * Loads the view from the serialized html and binds to this     
     */
    public addView2(): void {
        // Assume we get the directory based on the Extension routing
        let viewPath = this._extension.name + "/"; 
        let viewWithPath = `${viewPath}${this._config.viewName}`;
        console.log('[SHELL] addView, loading ', viewWithPath);

        // Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this._extension.id;
        let queryBaseElement = document.querySelector(elementSelector);
        if (!queryBaseElement){
            throw Error(`Can't find element matching selector: ${elementSelector}`);
        }

        let baseElement = queryBaseElement

        let loader = this._extensionResources.defaultLoader;
        let cachedTemplateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(viewWithPath);
        if (!cachedTemplateRegistryEntry || !cachedTemplateRegistryEntry.factory){

            loader.useTemplateLoader(this._extensionResources.textTemplateLoader);
            let templateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(viewWithPath);

            // Get associated viewFactory for template, otherwise create it and attach to templateRegistryEntry
            let viewFactory = templateRegistryEntry.factory;
            if (!viewFactory){
                this._extensionResources.viewResources = new ViewResources(this._extensionResources.viewResources, templateRegistryEntry.address);
                this._extensionResources.viewResources.bindingLanguage = this._extensionResources.container.get(TemplatingBindingLanguage);
                let viewCompiler = new ViewCompiler(this._extensionResources.container.get(TemplatingBindingLanguage) as BindingLanguage, this._extensionResources.viewResources)
                viewFactory = viewCompiler.compile(this._config.serializedView, this._extensionResources.viewResources, ViewCompileInstruction.normal);
                templateRegistryEntry.factory = viewFactory;
            }
            this._createBindView(viewFactory, baseElement);
        } else {
            let viewFactory = cachedTemplateRegistryEntry.factory;
            this._createBindView(viewFactory, baseElement);
        }


        // console.log('[SHELL] addView2: ', content);
        // //Insert the blade view at the element with the matching prefix + extension Id
        // let elementSelector = '#tap_ext\\:'+this.id;
        // let baseElement = document.querySelector(elementSelector);
        // //content = '<template> <div> <label for="title"><strong>Title:</strong></label> <input type="text" value.bind="title" /> </div> <br /> <div> <label for="subtitle"><strong>Subtitle:</strong></label> <input type="text" value.bind="subtitle & updateTrigger:\'blur\'" /> </div> <br /> <div> <label for="subtitle"><strong>Display:</strong></label> <span>${display}</span> </div> </template>';
        // if (baseElement){
        //     //let vSlot = new ViewSlot(baseElement, true);
        //     this._viewResources = new ViewResources(this._viewResources);
        //     this._viewResources.bindingLanguage = this._container.get(BindingLanguage);
        //     let viewCompiler = new ViewCompiler(this._container.get(BindingLanguage) as BindingLanguage, this._viewResources)
        //     let viewFactory = viewCompiler.compile(content, this._viewResources, ViewCompileInstruction.normal);
        //     let view = viewFactory.create(this._container, undefined, baseElement);
        //     console.log('[SHELL] addView2: created view', );
        //     view.appendNodesTo(baseElement);
        //     view.bind(viewModel);
        //     // Test loading an html file via a link element
        //     let link = document.createElement('link');
        //     link.rel = "import";
        //     link.href = "Ext1/landingBlade.html";
        //     link.onload = (e) => {
        //         console.log("import loaded");
        //         var link = (document.querySelector('link[rel="import"]') as HTMLLinkElement);
        //         if (link && link.import){
        //             var template = (link.import as Document).querySelector('template');
        //             if (template){
        //                 //(baseElement as Element).appendChild(template.content.cloneNode(true));
        //             }
        //         }
        //     };
        //     document.head.appendChild(link);
        //     console.log('[SHELL] addView2: view binding done', );
        //     /*
        //     this.instruction = {
        //         container: this.container,
        //         viewResources: this.viewResources,
        //         bindingContext: Extension.bindingContext,
        //         overrideContext: Extension.overrideContext,
        //         viewSlot: vSlot,
        //         viewModel: viewModel,
        //         host: baseElement 
        //     };
        //     console.log('[EXT] composing: ');
        //     this.compositionEngine.compose(this.instruction).then(controller => {
        //             console.log('[EXT] composed: ');
        //             vSlot.bind(Extension.bindingContext, Extension.overrideContext);
        //             vSlot.attached();
        //     });
        //     */
        //}
    }

    /**
     * Creates and binds the view.
     * @param viewFactory 
     * @param baseElement 
     */
    private _createBindView(viewFactory: ViewFactory, baseElement: Element): void {
        // create a new view and store it
        this._view = viewFactory.create(this._extensionResources.container, undefined, baseElement);
        console.log(`[SHELL] addView: created view ${this._config.viewName} `);
        // add the needed HTML nodes for the view to a bade element
        this._view.appendNodesTo(baseElement);
        // trigger an attach
        this._view.attached();
        // bind the view
        this._view.bind(this);
    }

    /**
     * Removes the blade's view. Peforms unbinding, detaching, and removal of nodes from the DOM.
     */
    public removeView(): void {
        // reverse order of _createBindView

        // unbind the view
        this._view.unbind();
        // trigger a detach
        this._view.detached();
        // remove the nodes from the DOM
        this._view.removeNodes();
    }
}

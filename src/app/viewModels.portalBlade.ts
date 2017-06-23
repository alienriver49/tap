import { inject, PLATFORM, Aurelia} from 'aurelia-framework';
import ConventionEngine from './conventionEngine';
import {IExtensionResources } from './extension';
import {Container, Factory} from 'aurelia-dependency-injection';
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {BindingLanguage, TemplateRegistryViewStrategy, ViewEngine, ViewSlot, ViewLocator, ViewFactory, ViewResources, TemplatingEngine, CompositionTransaction, CompositionEngine, View, CompositionContext, ViewCompiler, ViewCompileInstruction } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {TextTemplateLoader, DefaultLoader} from 'aurelia-loader-default'
import {HTMLImportTemplateLoader} from 'aurelia-html-import-template-loader'

import Blade from './../tapFx/ux/viewModels/viewModels.blade' 
import Extension from './extension'


export interface IPortalBladeConfig {
    bladeId: string;
    serializedBlade: Object;
    viewName: string;
    functions: string[]
}

export class PortalBlade extends Blade{
    private _extensionResources: IExtensionResources;
    public viewName: string;
    public bladeId: string;

    constructor(private _extension: Extension,
                public config: IPortalBladeConfig) { 
        super();
        this._extensionResources = _extension.getResources();
    }


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
        let viewWithPath = `${viewPath}${this.config.viewName}`;
        console.log('[SHELL] addView, loading ', viewWithPath);

        // Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this._extension.id;
        let queryBaseElement = document.querySelector(elementSelector);
        if (!queryBaseElement){
            throw Error(`Can't find element matching selector: ${elementSelector}`);
        }

        let baseElement = queryBaseElement

        let cachedViewFactory = this._extensionResources.container.get(viewWithPath);
        if (typeof cachedViewFactory === "string") {
            // Don't have a viewfactory for this view yet, so import, compile and cache it
            // The container.get call creates a resolver for the key if it can't find any matches,
            // but the resolver just returns the key string, so remove it
            this._extensionResources.container.unregister(viewWithPath);

            // extension passes the name of the main blade view
            let templateRegistryEntry = new TemplateRegistryEntry(this.config.viewName); 
            // Use the HTML Import loader
            let loader = this._extensionResources.defaultLoader;
            loader.useTemplateLoader(this._extensionResources.htmlImportLoader);

            loader.loadTemplate(viewWithPath).then((templateRegistryEntry) => {
                loader.useTemplateLoader(this._extensionResources.textTemplateLoader);

                if (templateRegistryEntry.template) {
                    // Delete the link element, otherwise if this blade/view is re-imported, the compiler will fail because it will
                    // be a duplicate link element
                    // Don't really need to delete it anymore since we're using cached viewFactories, but doesn't hurt to clean up
                    let linkToDelete = document.querySelector(`link[rel="import"][href="${viewPath}${this.config.viewName}"]`);
                    if (linkToDelete)
                        linkToDelete.remove();

                    // attempt to attach conventions before compiling the view
                    let docFragment = (templateRegistryEntry.template as HTMLTemplateElement).content;
                    if (this.config.functions.length > 0) this._extensionResources.conventionEngine.attachFunctions(docFragment, this.config.functions);

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

                    this._extensionResources.viewResources = new ViewResources(this._extensionResources.viewResources, templateRegistryEntry.address);
                    this._extensionResources.viewResources.bindingLanguage = this._extensionResources.container.get(TemplatingBindingLanguage);
                    let viewCompiler = new ViewCompiler(this._extensionResources.container.get(TemplatingBindingLanguage) as BindingLanguage, this._extensionResources.viewResources)
                    let viewFactory = viewCompiler.compile(templateRegistryEntry.template, this._extensionResources.viewResources, ViewCompileInstruction.normal);
                    this._extensionResources.container.registerInstance(viewWithPath, viewFactory); 
                    let view = viewFactory.create(this._extensionResources.container, undefined, baseElement);
                    console.log(`[SHELL] addView: created view ${this.config.viewName} `);
                    view.appendNodesTo(baseElement);
                    view.attached();
                    view.bind(this);
                }
            });
        }

        if (cachedViewFactory.constructor.name === "ViewFactory") {
            let view = cachedViewFactory.create(this._extensionResources.container, undefined, baseElement);
            console.log(`[SHELL] addView: created view ${this.config.viewName} (cached)`, );
            view.appendNodesTo(baseElement);
            view.attached();
            view.bind(this);
        }

    }

}

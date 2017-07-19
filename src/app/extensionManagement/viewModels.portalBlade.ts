import { inject } from 'aurelia-framework';
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import { BindingLanguage, ViewSlot, ViewFactory, ViewResources, View, ViewCompiler, ViewCompileInstruction } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {IExtensionResources, Extension } from './extension';

export interface IPortalBladeConfig {
    bladeId: string;
    serializedBlade: Object;
    viewName: string;
    serializedView: string,
    functions: string[]
}

//@inject('TapFx')
export class PortalBlade {
    constructor(
        private _tapFx: ITapFx,
        private _extension: Extension,
        private _config: IPortalBladeConfig,
    ) {
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
    public addViewFromViewName(): void {
        // Assume we get the directory based on the Extension routing
        let viewPath = this._extension.name + "/"; 
        let viewWithPath = `${viewPath}${this._config.viewName}`;
        console.log('[SHELL] addView, loading ', viewWithPath);

        // Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this._extension.id;
        let queryBaseElement = document.querySelector(elementSelector);
        if (!queryBaseElement) {
            throw Error(`Can't find element matching selector: ${elementSelector}`);
        }

        let baseElement = queryBaseElement

        let loader = this._extensionResources.defaultLoader;
        let cachedTemplateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(viewWithPath);
        if (!cachedTemplateRegistryEntry || !cachedTemplateRegistryEntry.factory) {
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
                    if (this._config.functions.length > 0) this._tapFx.ConventionEngine.attachFunctions(docFragment, this._config.functions);

                    // Get associated viewFactory for template, otherwise create it and attach to templateRegistryEntry
                    let viewFactory = templateRegistryEntry.factory;
                    if (!viewFactory) {
                        this._extensionResources.viewResources = new ViewResources(this._extensionResources.viewResources, templateRegistryEntry.address);
                        this._extensionResources.viewResources.bindingLanguage = this._extensionResources.container.get(TemplatingBindingLanguage);
                        let viewCompiler = new ViewCompiler(this._extensionResources.container.get(TemplatingBindingLanguage) as BindingLanguage, this._extensionResources.viewResources)
                        viewFactory = viewCompiler.compile(templateRegistryEntry.template, this._extensionResources.viewResources, ViewCompileInstruction.normal);
                        templateRegistryEntry.factory = viewFactory;
                    }
                    this._createBindView(viewFactory, baseElement);
                }
            });
        } else {
            let viewFactory = cachedTemplateRegistryEntry.factory;
            this._createBindView(viewFactory, baseElement);
        }
    }

    /**
     * Loads the view from the serialized html and binds to this     
     */
    public addViewFromSerializedHtml(): void {
        // Assume we get the directory based on the Extension routing
        let viewPath = this._extension.name + "/"; 
        let viewWithPath = `${viewPath}${this._config.viewName}`;
        console.log('[SHELL] addView, loading ', viewWithPath);

        // Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this._extension.id;
        let queryBaseElement = document.querySelector(elementSelector);
        if (!queryBaseElement) {
            throw Error(`Can't find element matching selector: ${elementSelector}`);
        }

        let baseElement = queryBaseElement

        let loader = this._extensionResources.defaultLoader;
        let cachedTemplateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(viewWithPath);
        if (!cachedTemplateRegistryEntry || !cachedTemplateRegistryEntry.factory) {
            loader.useTemplateLoader(this._extensionResources.textTemplateLoader);
            let templateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(viewWithPath);

            // Get associated viewFactory for template, otherwise create it and attach to templateRegistryEntry
            let viewFactory = templateRegistryEntry.factory;
            if (!viewFactory) {
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

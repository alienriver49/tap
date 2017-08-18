import { inject } from 'aurelia-framework';
import { Loader, TemplateRegistryEntry } from 'aurelia-loader';
import { DOM } from 'aurelia-pal';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding';
import { BindingLanguage, ViewSlot, ViewFactory, ViewResources, View, ViewCompiler, ViewCompileInstruction, HtmlBehaviorResource } from 'aurelia-templating';
import { IAddBladeMessage } from '../../fx/core/extension/extension'; 
import { SerializedView } from '../../fx/binding/serializedView';

import { ITapFx } from '../../fx/core/bootstrap';
import { IExtensionResources, Extension } from './extension';

@inject('TapFx')
export class PortalBlade {
    constructor(
        private _tapFx: ITapFx,
        private _extension: Extension,
        private _config: IAddBladeMessage,
    ) {
        this._extensionResources = _extension.getResources();
        // set this from the config
        this.bladeId = _config.bladeId;

        // get the extension path (directory) and the path to the view
        this._extensionPath = this._extension.name + '/';

        // find the base element with the matching prefix + extension Id, this will be where the blade is inserted
        const elementSelector = '#tap_ext\\:' + this._extension.id;
        const queryBaseElement = document.querySelector(elementSelector);
        if (!queryBaseElement) {
            throw Error(`Can't find element matching selector: ${elementSelector}`);
        }
        this._baseElement = queryBaseElement;
    }

    private _extensionResources: IExtensionResources;

    /**
     * The blade's id, set via the config.
     * @readonly
     */
    public readonly bladeId: string;

    /**
     * The blade's view. Stored for removal.
     * @internal
     */
    private _view: View;

    /**
     * Flags whether the view has been added to the DOM.
     */
    private _isViewAdded: boolean = false;

    /**
     * The extension path (directory).
     */
    private _extensionPath: string;

    /**
     * The base element where blades will be inserted.
     */
    private _baseElement: Element;

    /**
     * Creates a bindable view and adds that view to the portal.
     */
    public createAndAddView(): void {
        const viewsToLoad: Array<Promise<any>> = [];
        this._config.serializedViews.forEach((serializedView: SerializedView) => {
            viewsToLoad.push(this._getViewFactory(serializedView));
        });
        Promise.all(viewsToLoad).then(() => {
            // Load the viewfactory from the TemplateRegistryEntry
            const templateUrl = this._extensionResources.defaultLoader.applyPluginToUrl(this._config.viewName, 'template-registry-entry');
            const bladeTemplateRegistryEntry = this._extensionResources.defaultLoader.getOrCreateTemplateRegistryEntry(templateUrl);
            if (bladeTemplateRegistryEntry && bladeTemplateRegistryEntry.factory) {
                this._createView(bladeTemplateRegistryEntry.factory);
                this.addView();
            }
        });
    }

    /**
     * Get a view factory based on the blade's configuration. This will look for cached view factories or use the template loader to load and create a new one.
     */
    private _getViewFactory(serializedView: SerializedView): Promise<any> {
        return new Promise<any>((resolve) => {
            //const viewPath = `${this._extensionPath}${serializedView.viewName}`;
            const viewPath = serializedView.viewName; // Don't use path
            const templateUrl = this._extensionResources.defaultLoader.applyPluginToUrl(serializedView.viewName, 'template-registry-entry');
            const loader = this._extensionResources.defaultLoader;
            const cachedTemplateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(templateUrl);

            // If no factory or extension is different, then update the templateRegistry
            // If we have multiple active extensions with identically named views this will cause issues
            // and we'll need to rework this
            if (!cachedTemplateRegistryEntry || !cachedTemplateRegistryEntry.factory || cachedTemplateRegistryEntry['tapExtensionId'] !== this._extension.id) {
                // load the view factory for serialized HTML
                if (serializedView.view) {
                    loader.useTemplateLoader(this._extensionResources.textTemplateLoader);
                    const templateRegistryEntry = loader.getOrCreateTemplateRegistryEntry(templateUrl);
                    // Add a new property to the template registry entry for the extension Id
                    templateRegistryEntry['tapExtensionId'] = this._extension.id;
                    this._createViewFactory(templateRegistryEntry, serializedView);
                    resolve();
                } else {
                    // DMF The HTML import loader code is currently BROKEN 
                    // Use the HTML Import loader
                    loader.useTemplateLoader(this._extensionResources.htmlImportLoader);

                    // The loader caches templateRegistryEntries in its templateRegistry,
                    loader.loadTemplate(viewPath).then((templateRegistryEntry) => {
                        loader.useTemplateLoader(this._extensionResources.textTemplateLoader);
                        // the loadTemplate call automatically creates a resolver for the view in the global container
                        // But the resolver just returns the view string, so we don't want to keep it, so try to remove it
                        // if (this._extensionResources.container.parent && this._extensionResources.container.parent.get(this._viewPath))
                        //     this._extensionResources.container.parent.unregister(this._viewPath);

                        if (templateRegistryEntry.template) {
                            // Delete the link element, otherwise if this blade/view is re-imported, the compiler will fail because it will
                            // be a duplicate link element
                            // Don't really need to delete it anymore since we're using cached viewFactories, but doesn't hurt to clean up
                            const linkToDelete = document.querySelector(`link[rel="import"][href="${this._extensionPath}${this._config.viewName}"]`);
                            if (linkToDelete) {
                                linkToDelete.remove();
                            }

                            // attempt to attach conventions before compiling the view
                            // const docFragment = (templateRegistryEntry.template as HTMLTemplateElement).content;
                            // if (this._config.functions.length > 0) {
                            //     this._tapFx.ConventionEngine.attachConventions(docFragment, this, this._config.functions);
                            // }

                            // Get associated viewFactory for template, otherwise create it and attach to templateRegistryEntry
                            if (!templateRegistryEntry.factory) {
                                this._createViewFactory(templateRegistryEntry, serializedView);
                            }
                            resolve();
                        }
                    });
                }
            } else {
                resolve();
            }
        });
    }

    /**
     * Creates a view factory and attaches it to the passed template registry entry. 
     * @param templateRegistryEntry 
     */
    private _createViewFactory(templateRegistryEntry: TemplateRegistryEntry, serializedView: SerializedView): void {
        const viewResources = new ViewResources(this._extensionResources.viewResources, templateRegistryEntry.address);
        viewResources.bindingLanguage = this._extensionResources.container.get(TemplatingBindingLanguage);
        const viewCompiler = new ViewCompiler(viewResources.bindingLanguage, viewResources);
        const viewFactory = viewCompiler.compile(serializedView.view, viewResources, ViewCompileInstruction.normal);
        templateRegistryEntry.factory = viewFactory;
        templateRegistryEntry.factoryIsReady = true;
        templateRegistryEntry.template = DOM.createTemplateFromMarkup(serializedView.view);
        templateRegistryEntry.templateIsLoaded = true;
    }

    /**
     * Creates the blade's view from the passed view factory.
     * @param viewFactory 
     */
    private _createView(viewFactory: ViewFactory): void {
        // create a new view and store it
        this._view = viewFactory.create(this._extensionResources.container, undefined, this._baseElement);
    }

    /**
     * Adds the blade's view. Performs appending of nodes to the base element (DOM node), attaching, and binding.
     */
    public addView(): void {
        if (!this._view) {
            throw Error('View has not been created yet for this blade.');
        }
        
        if (this._isViewAdded) {
            throw Error('Blade view has not been removed or has already been added.');
        }

        console.log(`[SHELL] adding view`);
        // add the needed HTML nodes for the view to a bade element
        this._view.appendNodesTo(this._baseElement);
        // trigger an attach
        this._view.attached();
        // bind the view
        this._view.bind(this);

        this._isViewAdded = true;
    }

    /**
     * Removes the blade's view. Peforms unbinding, detaching, and removal of nodes from the DOM.
     */
    public removeView(): void {
        if (!this._isViewAdded) {
            throw Error('Blade view has not been added or has already been removed.');
        }

        console.log(`[SHELL] removing view`);
        // reverse order of addView
        // unbind the view
        this._view.unbind();
        // trigger a detach
        this._view.detached();
        // remove the nodes from the DOM
        this._view.removeNodes();

        this._isViewAdded = false;
    }
}

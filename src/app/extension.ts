import { inject, PLATFORM, Aurelia} from 'aurelia-framework'
import BindingEngine from './../tapFx/binding/bindingEngine'
import {Container, Factory} from 'aurelia-dependency-injection';
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {BindingLanguage, ViewSlot, ViewFactory, ViewResources, TemplatingEngine, CompositionTransaction, CompositionEngine, View, CompositionContext, ViewCompiler, ViewCompileInstruction } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {TextTemplateLoader, DefaultLoader} from 'aurelia-loader-default'
import {HTMLImportTemplateLoader} from 'aurelia-html-import-template-loader'

@inject(BindingEngine, Loader, Container, CompositionEngine, ViewResources, TextTemplateLoader)
class Extension {
    constructor(
        private _bindingEngine: BindingEngine,
        private _defaultLoader: DefaultLoader,
        private _container: Container,
        private _compositionEngine: CompositionEngine,
        private _viewResources: ViewResources,
        private _textTemplateLoader: TextTemplateLoader,
        public id: string,
        public name: string
    ) { 
        this._defaultLoader = _defaultLoader || new PLATFORM.Loader();
        this._container = _container || (new Container()).makeGlobal();
        this._viewResources = _viewResources || new ViewResources();
	    this._container.registerSingleton(TemplatingBindingLanguage, TemplatingBindingLanguage);
    }

    public static bindingContext: Object = {};
    public static overrideContext: Object = {};
    blades: Object[] = [];
    private instruction: CompositionContext;
    private _htmlImportTemplateLoader: HTMLImportTemplateLoader;

    private _registerBladeBindings(bladeID: string, blade: Object): void {
        this._bindingEngine.resolveId(blade, bladeID);

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
                prop.charAt(0) !== '_' &&
                window.TapFx.Utilities.classOf(blade[prop]) !== '[object Function]'
            ) {
                this._bindingEngine.observe(blade, prop, this.id);
            }
        }
    }

    private _unregisterBladeBindings(blade: Object): void {
        this._bindingEngine.unobserve(blade);
    }

    private _unregisterAllBladeBindings(): void {
        this._bindingEngine.unobserveAll();
    }

    addBlade(bladeID: string, serializedBlade: Object, viewName: string): void {
        let blade = new window.TapFx.ViewModels.Blade();
        Object.assign(blade, serializedBlade);
        this._registerBladeBindings(bladeID, blade);
        this.blades.push(blade);
        // Load the view with the passed name
        this.addView(viewName, blade);
        // Deserialize the view with aurelia and bind it to the blade (viewmodel)
        //this.addView2(serializedView, blade);
    }


    private host: any = {};

    /**
     * For the passed view, check if any cached ViewFactories exist for it.
     * If so, use the cached ViewFactory and bind it to the passed viewModel and 
     * append it to the DOM
     * If not, load the view via HTML Import and create and cache the ViewFactory,
     * then bind it to passed view model and append it to the DOM
     * @param viewName Name of the view to load 
     * @param viewModel Viewmodel object to bind to the view
     */
    private addView(viewName: string, viewModel: object): void {
        console.log('[SHELL] addView2: ');
        // Assume we get the directory based on the Extension routing
        let viewPath = this.name + "/"; 
        let viewWithPath = `${viewPath}${viewName}`;
        //Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this.id;
        let queryBaseElement = document.querySelector(elementSelector);
        if (queryBaseElement){
            let baseElement = queryBaseElement

            let cachedViewFactory = this._container.get(viewWithPath);
            if (typeof cachedViewFactory === "string"){
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
                    if (templateRegistryEntry.template){
                        // Delete the link element, otherwise if this blade/view is re-imported, the compiler will fail because it will
                        // be a duplicate link element
                        // Don't really need to delete it anymore since we're using cached viewFactories, but doesn't hurt to clean up
                        let linkToDelete = document.querySelector(`link[rel="import"][href="${viewPath}${viewName}"]`);
                        if (linkToDelete)
                            linkToDelete.remove();

                        //(baseElement as Element).appendChild((templateRegistryEntry.template as HTMLTemplateElement).content.cloneNode(true));
                        this._viewResources = new ViewResources(this._viewResources, viewPath + viewName);
                        this._viewResources.bindingLanguage = this._container.get(BindingLanguage);
                        let viewCompiler = new ViewCompiler(this._container.get(BindingLanguage) as BindingLanguage, this._viewResources)
                        let viewFactory = viewCompiler.compile(templateRegistryEntry.template, this._viewResources, ViewCompileInstruction.normal);
                        this._container.registerInstance(viewWithPath, viewFactory); 
                        let view = viewFactory.create(this._container, undefined, baseElement);
                        console.log('[SHELL] addView2: created view', );
                        view.appendNodesTo(baseElement);
                        view.bind(viewModel);
                    }
                });
            }

            if (cachedViewFactory.constructor.name === "ViewFactory"){
                let view = cachedViewFactory.create(this._container, undefined, baseElement);
                console.log('[SHELL] addView2: created view (cached)', );
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
    private addView2(content: string, viewModel: object): void {
        console.log('[SHELL] addView: ', content);
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
            console.log('[SHELL] addView: created view', );
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
            console.log('[SHELL] addView: view binding done', );
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
        }
    }

    /**
     * Remove a blade and it's binding from an extension.
     * @param blade 
     */
    removeBlade(blade: Object): void {
        let index = this.blades.indexOf(blade);
        if (index !== -1) {
            this._unregisterBladeBindings(blade);
            this.blades.splice(index, 1);
        }
    }

    /**
     * Remove all blades.
     */
    removeBlades(): void {
        this._unregisterAllBladeBindings();
        this.blades.splice(0, this.blades.length);
    }
}

export default Extension
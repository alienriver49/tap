import { inject, Factory} from 'aurelia-framework'
import {Container} from 'aurelia-dependency-injection';
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {DefaultLoader, TextTemplateLoader} from 'aurelia-loader-default';
import {BindingLanguage, TemplateRegistryViewStrategy, ViewEngine, ModuleAnalyzer, ViewSlot, ViewLocator, ViewFactory, ViewResources, TemplatingEngine, CompositionTransaction, CompositionEngine, View, CompositionContext, ViewCompiler, ViewCompileInstruction } from 'aurelia-templating';
import {HTMLImportTemplateLoader} from 'aurelia-html-import-template-loader'
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {PortalBlade, IPortalBladeConfig} from './viewModels.portalBlade'
import DeferredPromise from './../../tapFx/core/deferredPromise'
import {IChildMetadata, ISerializedObject, IUnresolvedRef} from './../../tapFx/binding/bindingEngine'; // TODO: move these to typings

let tapFx = window.TapFx;

export interface IExtensionResources {
    container: Container;
    viewResources: ViewResources;
    textTemplateLoader: TextTemplateLoader;
    htmlImportLoader: HTMLImportTemplateLoader;
    viewCompiler: ViewCompiler;
    viewEngine: ViewEngine; 
    defaultLoader: DefaultLoader;
}

@inject(Container, ViewResources, Loader, TextTemplateLoader, Factory.of(PortalBlade))
export class Extension {
    constructor(
        _globalContainer: Container,
        _globalViewResources: ViewResources,
        private _defaultLoader: DefaultLoader,
        _textTemplateLoader: TextTemplateLoader,
        private _portalBladeFactory: (...args: any[]) => PortalBlade, 
        public id: string,
        public name: string
    ) { 
        // Create a new child container for every extension
        this._container = new Container();
        this._container.parent = _globalContainer;
	    this._container.registerSingleton(TemplatingBindingLanguage, TemplatingBindingLanguage);
        // Create child ViewResources for every extension
        this._viewResources = new ViewResources(_globalViewResources);
        // Create loader for HTML Imports
        this._htmlImportLoader = new HTMLImportTemplateLoader("");

        // Create a new ViewCompiler and ViewEngine for the extension
        this._viewCompiler = new ViewCompiler(this._container.get(TemplatingBindingLanguage) as BindingLanguage, this._viewResources);
        this._viewEngine = new ViewEngine(this._defaultLoader, this._container, this._viewCompiler, this._container.get(ModuleAnalyzer), this._viewResources);
    }

    public blades: PortalBlade[] = [];
    private _container: Container;
    private _viewResources: ViewResources;
    private _textTemplateLoader: TextTemplateLoader;
    private _htmlImportLoader: HTMLImportTemplateLoader;
    private _viewCompiler: ViewCompiler;
    private _viewEngine: ViewEngine; 

    public getResources(): IExtensionResources {
        return {
            container: this._container,
            viewResources: this._viewResources,
            textTemplateLoader: this._textTemplateLoader,
            htmlImportLoader: this._htmlImportLoader,
            viewCompiler: this._viewCompiler,
            viewEngine: this._viewEngine,
            defaultLoader: this._defaultLoader,
        }
    }

    private _seen: Object[] = [];
    private _seenFlag: string = '$$__checked__$$';
    private _unresolvedRefs: IUnresolvedRef[] = [];

    private _registerBladeBindings(objectID: string, obj: PortalBlade | ISerializedObject, parentContextId?: string): void {
        if (!parentContextId){
            this._seen = [];
            this._unresolvedRefs = [];
        }
        
        // If this object has already been seen, don't dive in again
        if (obj.hasOwnProperty(this._seenFlag))
            return ;        

        tapFx.BindingEngine.resolveId(obj, objectID, parentContextId);

        // Recursively register any child objects first
        if (obj.hasOwnProperty('_childMetadata')){
            let childMetadata: IChildMetadata[] = obj['_childMetadata'];
            childMetadata.forEach((metadata) => {
                // Check if there is already a mapped context with the passed Id
                let existingChildObject = tapFx.BindingEngine.getContextById(metadata.contextId);
                if (existingChildObject){
                    // If so, we assume it's being observed and assign that to the parent object
                    obj[metadata.property] = existingChildObject;
                }else{
                    // If there is a value for the object, assign it
                    if (metadata.value){
                        let childObject: ISerializedObject = metadata.value;
                        // Must be an object, so add a temporary flag property to objects to prevent infinite loop from circular references
                        obj[this._seenFlag] = true;
                        this._seen.push(obj);

                        this._registerBladeBindings(metadata.contextId, childObject, metadata.parentId);
                        // And reinstantiate them on the parent object
                        obj[metadata.property] = childObject;
                    }else{
                        // Otherwise reference will be resolved later
                        this._unresolvedRefs.push({context: obj, property: metadata.property, refId: metadata.contextId});
                    }
                }
            });
        }

        if (!parentContextId){
            // First resolve the unresolved references
            this._unresolvedRefs.forEach((ref) => {
                let existingObject = tapFx.BindingEngine.getContextById(ref.refId);
                if (!existingObject)
                    throw new Error(`SHELL: Cannot resolve a reference for context Id: ${ref.refId}`);
                ref.context[ref.property] = existingObject;
            })
            // Remove the temporary flags from the objects
            this._seen.forEach((o) => {
                delete o[this._seenFlag];
            });

            let refIds: Set<string> = new Set<string>(); 
            for (let prop in obj) {
                // only register blade's own properties and not those on the prototype chain
                // anything starting with an underscore is treated as a private property and is not watched for changes
                // skip Functions
                if (obj.hasOwnProperty(prop) &&
                    prop.charAt(0) !== '_' &&
                    tapFx.Utilities.classOf(obj[prop]) !== '[object Function]'
                ) {
                    tapFx.BindingEngine.observe(obj, prop, refIds, this.id, parentContextId);
                }
            }
        }
    }

    private _unregisterBladeBindings(blade: PortalBlade): void {
        tapFx.BindingEngine.unobserveBlade(blade);
    }

    private _unregisterAllBladeBindings(): void {
        tapFx.BindingEngine.unobserveAll();
    }

    private _registerBladeFunctions(bladeID: string, blade: PortalBlade, functions: string[]) {
        console.log('[SHELL] Attaching blade functions: ', functions);
        // loop through all the passed functions and add them as a function to the serialized blade which will publish a message with the function data
        for (let func of functions) {
            var extId = this.id;
            blade[func] = function() {
                // publish the function call to the extension
                console.log('[SHELL] Publishing message from function: ' + func);
                tapFx.Rpc.publish('tapfx.' + bladeID + '.' + func, extId, { functionArgs: [...arguments] });
                
                // set up a subscription for any result from the calling of the function in the extension
                let resultPromise = new DeferredPromise();
                let subscription = tapFx.Rpc.subscribe('shell.' + bladeID + '.' + func, (data) => {
                    console.log('[SHELL] Receiving result from function: ' + func + ' result: ', data);
                    resultPromise.resolve(data);

                    // unsubscribe from the result subscription
                    subscription.unsubscribe();
                });

                return resultPromise.promise.then((result) => { return result; });
            };
        };
    }

    /**
     * Add a blade to an extension.
     * @param config
     */
    addBlade(config: IPortalBladeConfig): PortalBlade {
        let blade = new PortalBlade(this, config) 
        // Should we move these functions to PortalBlade?
        Object.assign(blade, config.serializedBlade);
        this._registerBladeBindings(config.bladeId, blade);
        this._registerBladeFunctions(config.bladeId, blade, config.functions);

        // Either load the serialized view or specified HTML file
        if (config.serializedView)
            blade.addView2();
        else
            blade.addView();

        this.blades.push(blade);
        
        return blade;
    }

    /**
     * Remove a blade and it's binding from an extension.
     * @param bladeId 
     */
    removeBlade(bladeId: string): void {
        let index = this.blades.findIndex((b) => {
            return b.bladeId === bladeId;
        });
        if (index !== -1) {
            let blade = this.blades[index];
            this._unregisterBladeBindings(blade);
            this.blades.splice(index, 1);
            blade.removeView();
        }
    }

    /**
     * Remove all blades.
     */
    removeBlades(): void {
        this._unregisterAllBladeBindings();
        this.blades.splice(0, this.blades.length);
        this.blades.forEach((blade) => { blade.removeView(); });
    }
}

export default Extension
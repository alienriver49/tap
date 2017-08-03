import { inject, Factory } from 'aurelia-framework';
import { Container } from 'aurelia-dependency-injection'; 
import { Loader, TemplateRegistryEntry } from 'aurelia-loader';
import { DefaultLoader, TextTemplateLoader } from 'aurelia-loader-default';
import { BindingLanguage, ViewEngine, ModuleAnalyzer, ViewResources, View, ViewCompiler } from 'aurelia-templating';
import { HTMLImportTemplateLoader } from 'aurelia-html-import-template-loader';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding';

import { ITapFx } from '../../fx/core/bootstrap';
import { DeferredPromise } from '../../fx/core/deferredPromise'; // TODO: add to tapFx object
import { ISerializedObject, IUnresolvedRef } from '../../fx/binding/bindingEngine'; // TODO: move these to typings
import { Utilities } from '../../fx/utilities/utilities';

import { PortalBlade, IPortalBladeConfig } from './viewModels.portalBlade';

export interface IExtensionResources {
    container: Container;
    viewResources: ViewResources;
    textTemplateLoader: TextTemplateLoader;
    htmlImportLoader: HTMLImportTemplateLoader;
    viewCompiler: ViewCompiler;
    viewEngine: ViewEngine; 
    defaultLoader: DefaultLoader;
}

@inject(Utilities, Container, ViewResources, Loader, TextTemplateLoader, Factory.of(PortalBlade), 'TapFx')
export class Extension {
    constructor(
        private _utilities: Utilities,
        private _globalContainer: Container,
        private _globalViewResources: ViewResources,
        private _defaultLoader: DefaultLoader,
        private _textTemplateLoader: TextTemplateLoader,
        private _portalBladeFactory: (...args: any[]) => PortalBlade,
        private _tapFx: ITapFx,
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
        this._htmlImportLoader = new HTMLImportTemplateLoader('');

        // Create a new ViewCompiler and ViewEngine for the extension
        this._viewCompiler = new ViewCompiler(this._container.get(TemplatingBindingLanguage) as BindingLanguage, this._viewResources);
        this._viewEngine = new ViewEngine(this._defaultLoader, this._container, this._viewCompiler, this._container.get(ModuleAnalyzer), this._viewResources);
    }

    public blades: PortalBlade[] = [];
    private _container: Container;
    private _viewResources: ViewResources;
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
        };
    }

    private _seen: object[] = [];
    private _seenFlag: string = '$$__checked__$$';
    private _unresolvedRefs: IUnresolvedRef[] = [];

    private _registerBladeBindings(obj: ISerializedObject, blade: PortalBlade): void {
        // add primitive properties to blade and set it up
        Object.assign(blade, obj.value);
        obj.value = blade;
        this._tapFx.BindingEngine.resolveSerializedObject(obj, blade, true);

        const metadata: ISerializedObject =  {
            property: '',
            contextId: '',
            parentId: '',
            value: null,
            type: '',
            childMetadata: [] 
        };
        this._tapFx.BindingEngine.observeObject(metadata, blade, new Set<string>(), this.id);
    }

    private _unregisterBladeBindings(blade: PortalBlade): void {
        this._tapFx.BindingEngine.unobserveBlade(blade);
    }

    private _unregisterAllBladeBindings(): void {
        this._tapFx.BindingEngine.unobserveAll();
    }

    private _registerBladeFunctions(bladeId: string, blade: PortalBlade, functions: string[]) {
        console.log('[SHELL] Attaching blade functions: ', functions);
        // loop through all the passed functions and add them as a function to the serialized blade which will publish a message with the function data
        for (const func of functions) {
            const extId = this.id;
            blade[func] = function() {
                // publish the function call to the extension
                console.log('[SHELL] Publishing message from function: ' + func);
                this._tapFx.Rpc.publish('tapfx.' + bladeId + '.' + func, extId, { functionArgs: Array.from(arguments)/*[...arguments]*/ });
                
                // set up a subscription for any result from the calling of the function in the extension
                const resultPromise = new DeferredPromise();
                const subscription = this._tapFx.Rpc.subscribe('shell.' + bladeId + '.' + func, (data) => {
                    console.log('[SHELL] Receiving result from function: ' + func + ' result: ', data);
                    resultPromise.resolve(data);

                    // unsubscribe from the result subscription
                    subscription.unsubscribe();
                });

                return resultPromise.promise.then(result => result);
            };
        }
    }

    /**
     * Add a blade to an extension.
     * @param config
     */
    public addBlade(config: IPortalBladeConfig): PortalBlade {
        const blade = this._portalBladeFactory(this, config);
        // Should we move these functions to PortalBlade?
        this._registerBladeBindings(config.serializedBlade as ISerializedObject, blade);
        this._registerBladeFunctions(config.bladeId, blade, config.functions);

        // create and add the view for the blade
        blade.createAndAddView();

        this.blades.push(blade);
        
        return blade;
    }

    /**
     * Add a blade's view to the DOM.
     * @param bladeId 
     */
    public addBladeView(bladeId: string): void {
        const blade = this.blades.find((b) => b.bladeId === bladeId);

        if (blade) {
            blade.addView();
        }
    }

    /**
     * Remove a blade and it's binding from an extension.
     * @param bladeId 
     */
    public removeBlade(bladeId: string): void {
        const index = this.blades.findIndex((b) => b.bladeId === bladeId);

        if (index !== -1) {
            const blade = this.blades[index];
            this._unregisterBladeBindings(blade);
            this.blades.splice(index, 1);
            blade.removeView();
        }
    }

    /**
     * Remove a blades view from the DOM.
     * @param bladeId 
     */
    public removeBladeView(bladeId: string): void {
        const blade = this.blades.find((b) => b.bladeId === bladeId);

        if (blade) {
            blade.removeView();
        }
    }

    /**
     * Remove all blades.
     */
    public removeBlades(): void {
        this._unregisterAllBladeBindings();
        this.blades.splice(0, this.blades.length);
        this.blades.forEach((blade) => { blade.removeView(); });
    }
}

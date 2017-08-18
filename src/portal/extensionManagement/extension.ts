import { inject, Factory } from 'aurelia-framework';
import { Container } from 'aurelia-dependency-injection'; 
import { Loader, TemplateRegistryEntry } from 'aurelia-loader';
import { DefaultLoader, TextTemplateLoader } from 'aurelia-loader-default';
import { BindingLanguage, ViewEngine, ModuleAnalyzer, ViewResources, View, ViewCompiler } from 'aurelia-templating';
import { HTMLImportTemplateLoader } from 'aurelia-html-import-template-loader';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding';

import { ITapFx } from '../../fx/core/bootstrap';
import { DeferredPromise } from '../../fx/core/deferredPromise'; // TODO: add to tapFx object
import { IAddBladeMessage } from '../../fx/core/extension/extension'; // TODO: add to tapFx object
import { SerializedObject } from '../../fx/binding/serializedObject'; // TODO: move these to typings
import { Utilities } from '../../fx/utilities/utilities';

import { PortalBlade } from './viewModels.portalBlade';

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

    private _registerBladeBindings(obj: SerializedObject, blade: PortalBlade): void {
        // add primitive properties to blade and set it up
        Object.assign(blade, obj.value);
        obj.value = blade;
        this._tapFx.BindingEngine.resolveSerializedObject(obj, true, this.id);

        const metadata = new SerializedObject();
        this._tapFx.BindingEngine.observeObject(metadata, blade, new Set<string>(), this.id, false, false);
    }

    private _unregisterBladeBindings(blade: PortalBlade): void {
        this._tapFx.BindingEngine.unobserveBlade(blade);
    }

    private _unregisterAllBladeBindings(): void {
        this._tapFx.BindingEngine.unobserveAll();
    }

    /**
     * Add a blade to an extension.
     * @param config
     */
    public addBlade(config: IAddBladeMessage): PortalBlade {
        const blade = this._portalBladeFactory(this, config);
        // Should we move this function to PortalBlade?
        this._registerBladeBindings(config.serializedBlade, blade);

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
        this.blades.forEach(blade => blade.removeView());
    }
}

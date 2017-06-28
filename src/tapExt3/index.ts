/// <reference path="./../typings.d.ts" />
import LandingBlade from './landingBlade'
import Blade from './../tapFx/ux/viewModels/viewModels.blade'
import {Container, Factory} from 'aurelia-dependency-injection';
import {inject, Aurelia, PLATFORM} from 'aurelia-framework'
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {View, BindingLanguage, ViewSlot, ViewResources, ViewCompiler, CompositionEngine, ViewCompileInstruction, TemplatingEngine, CompositionTransaction} from 'aurelia-templating';
import BindingEngine from './../tapFx/binding/bindingEngine'
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {TextTemplateLoader} from 'aurelia-loader-default'

@inject(BindingEngine, Loader, Container, CompositionEngine, ViewResources, TextTemplateLoader)
export class Index{
    constructor(
        private _bindingEngine: BindingEngine,
        private loader: Loader,
        private container: Container,
        private compositionEngine: CompositionEngine,
        private viewResources: ViewResources,
        private _textTemplateLoader: TextTemplateLoader
    ) { 
        this.loader = loader || new PLATFORM.Loader();
        this.container = container || (new Container()).makeGlobal();
        this.viewResources = viewResources || new ViewResources();
	    this.container.registerSingleton(TemplatingBindingLanguage, TemplatingBindingLanguage);
        //this.loader.loadAllModules([PLATFORM.moduleName('./landingBlade')])
    }

    public init(): void {
        console.log('[EXT-3] Index.init');
        // add the blade to extension manager
        let blade = new LandingBlade();
        blade.title = 'Title';
        blade.titleChanged(blade.title, "");
        this.addBlade(blade, "landingBlade.html");
    }

    public addBlade(blade: Blade, viewName: string): void {
        console.log('[EXT-3] Attempting to add blade.');
        window.TapFx.Extension.addBlade(blade, viewName);
    }
}

/// <reference path="./../typings.d.ts" />
import LandingBlade from './landingBlade'
import {Container, Factory} from 'aurelia-dependency-injection';
import {inject, Aurelia, PLATFORM} from 'aurelia-framework'
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {View, BindingLanguage, ViewSlot, ViewResources, ViewCompiler, CompositionEngine, ViewCompileInstruction, TemplatingEngine, CompositionTransaction} from 'aurelia-templating';
import BindingEngine from './../tapFx/binding/bindingEngine'
import { bootstrap } from 'aurelia-bootstrapper'
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {TextTemplateLoader} from 'aurelia-loader-default'

bootstrap(aurelia => {
    console.log('[EXT-2] bootstrap');

    // If this instance is in an iframe, use the id attribute as the InstanceId for RPC
    if (window.self !== window.top){
        let iframeWindow = window.frameElement;
        if (!iframeWindow)
            throw new Error('Could not find frameElement');
        let id = iframeWindow.getAttribute("id") as string;
        if (!id)
            throw new Error('Could not find id attribute on iframe element');
        window.TapFx.Rpc.setInstanceId(id)
    }

     aurelia.container.registerSingleton(Init, Init);
     let init = aurelia.container.get(Init);

     // here's where we get the html for serializing 
     init.getView('tapExt2/landingBlade.html').then((serializedView) => {
        console.log('[EXT-2], got view', serializedView);
        // Then add the blade to extension manager
        let blade = new LandingBlade();
        blade.title = 'Title';
        blade.subtitle = 'Subtitle';
        blade.display = 'NOT MATCHING';
        init.addBlade(blade, serializedView);
     })
});


@inject(BindingEngine, Loader, Container, CompositionEngine, ViewResources, TextTemplateLoader)
class Init{
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
    }

    /**
     * Load the passed html file into a view 
     * @param source html file name
     */
    public getView(source: string): Promise<string> {
        console.log('[EXT-2], getView begin: ', source);
        return new Promise<string>((resolve, reject) => {
            let templateRegistryEntry = new TemplateRegistryEntry(source); 
            // Load the html file into a template (basically a string)
            this._textTemplateLoader.loadTemplate(this.loader, templateRegistryEntry).then(() => {
                let template = templateRegistryEntry.template;
                // This is the raw HTML before any interpolation
                let serializedView = '<template>' + template.innerHTML + '</template>'; 

                this.viewResources = new ViewResources(this.viewResources);
                this.viewResources.bindingLanguage = this.container.get(TemplatingBindingLanguage);
                let viewCompiler = new ViewCompiler(this.container.get(TemplatingBindingLanguage) as BindingLanguage, this.viewResources)
                let viewFactory = viewCompiler.compile(template, this.viewResources, ViewCompileInstruction.normal);
                let view = viewFactory.create(this.container, undefined, undefined);

                resolve(serializedView);
            })
        });
    }

    public addBlade(blade: LandingBlade, serializedView: string): void {
        console.log('[EXT-2] Attempting to add blade.');
        window.TapFx.Extension.addBlade(blade, serializedView);
    }
}
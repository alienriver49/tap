import { inject, PLATFORM, Aurelia } from 'aurelia-framework'
import BindingEngine from './../tapFx/binding/bindingEngine'
import {Container, Factory} from 'aurelia-dependency-injection';
import {Loader} from 'aurelia-loader';
import {BindingLanguage, ViewSlot, ViewResources, TemplatingEngine, CompositionTransaction, CompositionEngine, View, CompositionContext, ViewCompiler, ViewCompileInstruction } from 'aurelia-templating';
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'


@inject(BindingEngine, Loader, Container, CompositionEngine, ViewResources)
class Extension {
    constructor(
        private _bindingEngine: BindingEngine,
        private loader: Loader,
        private container: Container,
        private compositionEngine: CompositionEngine,
        private viewResources: ViewResources,
        public id: string
    ) { 
        this.loader = loader || new PLATFORM.Loader();
        this.container = container || (new Container()).makeGlobal();
        this.viewResources = viewResources || new ViewResources();
	    this.container.registerSingleton(BindingLanguage, TemplatingBindingLanguage);
	    this.container.registerAlias(BindingLanguage, TemplatingBindingLanguage);
    }

    public static bindingContext: Object = {};
    public static overrideContext: Object = {};
    blades: Object[] = [];
    private instruction: CompositionContext;

    private _registerBladeBindings(bladeID: string, blade: Object): void {
        this._bindingEngine.resolveId(blade, bladeID);

        for (let prop in blade) {
            // only register blade's own properties and not those on the prototype chain
            // anything starting with an underscore is treated as a private property and is not watched for changes
            // skip Functions
            if (blade.hasOwnProperty(prop) &&
                prop.charAt(0) !== '_' &&
                ({}).toString.call(blade[prop] !== '[object Function]')
            ) {
                this._bindingEngine.observe(blade, prop, this.id);
            }
        }
    }

    addBlade(bladeID: string, serializedBlade: Object, serializedView: string): void {
        let blade = new window.TapFx.ViewModels.Blade();
        Object.assign(blade, serializedBlade);
        this._registerBladeBindings(bladeID, blade);
        this.blades.push(blade);
        // Deserialize the view with aurelia and bind it to the blade (viewmodel)
        this.addView(serializedView, blade);
    }


    private host: any = {};

    private addView(content: string, viewModel: object): void {
        console.log('[SHELL] addView: ', content);
        //Insert the blade view at the element with the matching prefix + extension Id
        let elementSelector = '#tap_ext\\:'+this.id;
        let baseElement = document.querySelector(elementSelector);
        //content = '<template> <div> <label for="title"><strong>Title:</strong></label> <input type="text" value.bind="title" /> </div> <br /> <div> <label for="subtitle"><strong>Subtitle:</strong></label> <input type="text" value.bind="subtitle & updateTrigger:\'blur\'" /> </div> <br /> <div> <label for="subtitle"><strong>Display:</strong></label> <span>${display}</span> </div> </template>';
        if (baseElement){
            //let vSlot = new ViewSlot(baseElement, true);
            this.viewResources = new ViewResources(this.viewResources);
            this.viewResources.bindingLanguage = this.container.get(BindingLanguage);
            let viewCompiler = new ViewCompiler(this.container.get(BindingLanguage) as BindingLanguage, this.viewResources)
            let viewFactory = viewCompiler.compile(content, this.viewResources, ViewCompileInstruction.normal);
            let view = viewFactory.create(this.container, undefined, baseElement);
            console.log('[SHELL] addView: created view', );
            view.appendNodesTo(baseElement);
            view.bind(viewModel);
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

}

export default Extension
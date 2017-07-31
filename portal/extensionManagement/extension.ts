import { inject, Factory} from 'aurelia-framework'
import {Container} from 'aurelia-dependency-injection';
import {Loader, TemplateRegistryEntry} from 'aurelia-loader';
import {DefaultLoader, TextTemplateLoader} from 'aurelia-loader-default';
import {BindingLanguage, ViewEngine, ModuleAnalyzer, ViewResources, View, ViewCompiler } from 'aurelia-templating';
import {HTMLImportTemplateLoader} from 'aurelia-html-import-template-loader'
import { TemplatingBindingLanguage } from 'aurelia-templating-binding'
import {PortalBlade, IPortalBladeConfig} from './viewModels.portalBlade'
import DeferredPromise from './../../tapFx/core/deferredPromise'; // TODO: add to tapFx object
import {ISerializedObject, IUnresolvedRef} from './../../tapFx/binding/bindingEngine'; // TODO: move these to typings
import {Utilities} from './../../tapFx/utilities/utilities'

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
        this._htmlImportLoader = new HTMLImportTemplateLoader("");

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
        }
    }

    private _seen: Object[] = [];
    private _seenFlag: string = '$$__checked__$$';
    private _unresolvedRefs: IUnresolvedRef[] = [];

    // private _resolveBladeBindings(obj: ISerializedObject, node: Object = {}): Object {
    //     if (!obj.parentId){
    //         this._seen = [];
    //         this._unresolvedRefs = [];
    //     }
        
    //     // If this object has already been seen, don't dive in again
    //     if (obj.hasOwnProperty(this._seenFlag))
    //         return {};        

    //     obj[this._seenFlag] = true;
    //     this._seen.push(obj);

    //     // node is our deserialized object without extraneous properties from the passed data
    //     if (obj.parentId)
    //         node[obj.property] = obj.value;
    //     else
    //         node = obj.value;

    //     this._tapFx.BindingEngine.resolveId(obj.value, obj.contextId, obj.parentId, obj.property);

    //     // Recursively register any child objects first
    //     // For objects, they're in the childMetadata
    //     if (obj.type === 'o'){
    //         obj.childMetadata.forEach((metadata) => {
    //             // Check if there is already a mapped context with the passed Id
    //             let existingChildObject = this._tapFx.BindingEngine.getContextById(metadata.contextId);
    //             if (existingChildObject){
    //                 // If so, we assume it's being observed and assign that to the parent object
    //                 // Updates node via object reference
    //                 (obj.value as Object)[metadata.property] = existingChildObject;
    //             }else{
    //                 if (metadata.value){
    //                     if (['a', 'o'].indexOf(metadata.type) >= 0)
    //                         this._resolveBladeBindings(metadata, node[obj.property]);
    //                     // And reinstantiate on parent (updates node via object reference)
    //                     (obj.value as Object)[metadata.property] = metadata.value;
    //                 }else{
    //                     // Otherwise reference will be resolved later
    //                     this._unresolvedRefs.push({context: obj.value, property: metadata.property, refId: metadata.contextId});
    //                 }
    //             }
    //         });
    //     }

    //     // For collections, they're in the value collection
    //     if (obj.type === 'a'){
    //         (obj.value as any[]).forEach((element: any, index: number, theArray: any[]) => {
    //             if (this._utilities.isPrimitive(element)){
    //                 theArray[index] = element;
    //             }else{
    //                 let serializedElement = element as ISerializedObject;
    //                 // Check if there is already a mapped context with the passed Id
    //                 let existingChildObject = this._tapFx.BindingEngine.getContextById(serializedElement.contextId);
    //                 if (existingChildObject){
    //                     // If so, we assume it's being observed and assign that to the parent object
    //                     // Updates node via array reference
    //                     theArray[serializedElement.property] = existingChildObject;
    //                 }else{
    //                     if (serializedElement.value){
    //                         if (['a', 'o'].indexOf(serializedElement.type) >= 0)
    //                             this._resolveBladeBindings(serializedElement, node[obj.property]);
    //                         // And reinstantiate on parent (updates node via array reference)
    //                         theArray[serializedElement.property] = serializedElement.value;
    //                     }else{
    //                         // Otherwise reference will be resolved later
    //                         this._unresolvedRefs.push({context: obj.value, property: serializedElement.property, refId: serializedElement.contextId});
    //                     }
    //                 }
    //             }

    //         })
    //     }
        

    //     if (!obj.parentId){
    //         // First resolve the unresolved references
    //         this._unresolvedRefs.forEach((ref) => {
    //             let existingObject = this._tapFx.BindingEngine.getContextById(ref.refId);
    //             if (!existingObject)
    //                 throw new Error(`SHELL: Cannot resolve a reference for context Id: ${ref.refId}`);
    //             ref.context[ref.property] = existingObject;
    //         })
    //         // Remove the temporary flags from the objects
    //         this._seen.forEach((o) => {
    //             delete o[this._seenFlag];
    //         });

    //     }
    //     return node;
    // }

    private _registerBladeBindings(obj: ISerializedObject, blade: PortalBlade): void {
        // add primitive properties to blade and set it up
        Object.assign(blade, obj.value);
        obj.value = blade;
        this._tapFx.BindingEngine.resolveSerializedObject(obj, blade, true);

        let metadata: ISerializedObject =  {
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
        for (let func of functions) {
            var extId = this.id;
            blade[func] = function() {
                // publish the function call to the extension
                console.log('[SHELL] Publishing message from function: ' + func);
                this._tapFx.Rpc.publish('tapfx.' + bladeId + '.' + func, extId, { functionArgs: Array.from(arguments)/*[...arguments]*/ });
                
                // set up a subscription for any result from the calling of the function in the extension
                let resultPromise = new DeferredPromise();
                let subscription = this._tapFx.Rpc.subscribe('shell.' + bladeId + '.' + func, (data) => {
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
        // TODO: Figure this out using this._portalBladeFactory
        let blade = new PortalBlade(this._tapFx, this, config) /*this._portalBladeFactory(this, config)*/;
        // Should we move these functions to PortalBlade?
        this._registerBladeBindings(config.serializedBlade as ISerializedObject, blade);
        this._registerBladeFunctions(config.bladeId, blade, config.functions);

        // Either load the serialized view or specified HTML file
        if (config.serializedView)
            blade.addViewFromSerializedHtml();
        else
            blade.addViewFromViewName();

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
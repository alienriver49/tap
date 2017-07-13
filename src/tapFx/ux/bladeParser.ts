import { inject } from 'aurelia-framework'
import BaseBlade from './viewModels/viewModels.baseBlade'
import * as tapc from './tapcModules'
import {tapcBase} from './components/tapcBase'
import {tapcBaseContainer} from './components/tapcBaseContainer'
import ConventionEngine from './conventionEngine'

@inject(ConventionEngine)
export class BladeParser {
    constructor(
        private _conventionEngine: ConventionEngine
    ) {

    }

    /**
     * Parse the passed blade into an HTML template.
     * @param blade 
     * @param bladeFunctions 
     */
    public parseBladeToHTML(blade: BaseBlade, bladeFunctions: string[]): string {
        // Can't get innerHtml or outerHtml property from template element,
        // so use a temp div element as the parent
        let parent: HTMLDivElement = document.createElement('div');

        // add a border to the blade
        let styleAttr = document.createAttribute('style');
        styleAttr.value = 'border: 2px solid black; padding: 10px;';
        parent.attributes.setNamedItem(styleAttr);

        // add a remove blade button
        let removeBladeButton = document.createElement('button');
        styleAttr = document.createAttribute('style');
        styleAttr.value = 'float: right;';
        removeBladeButton.name = 'remove';
        removeBladeButton.textContent = 'Remove';
        removeBladeButton.attributes.setNamedItem(styleAttr);
        parent.appendChild(removeBladeButton);


        // POC: Could render different types of blades differently
        /*if (blade instanceof FormBlade) {

        }*/
        
        for(let i = 0; i < blade.content.length; i++){
            let el = this.parseNode(parent, blade.content[i]);
        }

        this._conventionEngine.attachFunctions(parent, bladeFunctions);

        return `<template>${parent.outerHTML}</template>`;
    }

    /**
     * Parse a tap component node and add the appropriate element to the passed parent.
     * @param parent 
     * @param node 
     */
    public parseNode(parent: Element, node: tapcBase): void {
        let attrRegExp: RegExp = /^attribute(.*)/;
        let privateAttrRegExp: RegExp = /^_attribute(.*)/;
        let eventRegExp: RegExp = /^event(.*)/;
        let match: RegExpExecArray | null;
        let bindRegExp = /^@(.*)/;
        let bindMatch: RegExpExecArray | null;
        let el: HTMLElement | null = null; 

        if (node instanceof tapc.tapcDiv){
            el = document.createElement('div');
        }
        if (node instanceof tapc.tapcLabel){
            el = document.createElement('label');
        }
        if (node instanceof tapc.tapcLineBreak){
            el = document.createElement('br');
        }
        if (node instanceof tapc.tapcInput){
            el = document.createElement('input');
        }
        if (node instanceof tapc.tapcText){
            let textNode = document.createTextNode(node.attributeText);
            if (bindMatch = bindRegExp.exec(node.attributeText))
                textNode.data = window.TapFx.Utilities.camelCaseToHyphen('${'+ bindMatch[1] + '}');
            parent.appendChild(textNode);
        }
        if (node instanceof tapc.tapcTapTestComponent){
            el = document.createElement('tap-test-component');
        }
        if (node instanceof tapc.tapcDataTable){
            let dataTable = node as tapc.tapcDataTable;
            if (!dataTable.attributeColumnConfiguration)
                throw new Error(`Column configuration must be set on tapcDataTable`);
            el = document.createElement('tap-data-table');
        }
        if (node instanceof tapc.tapcMdcCheckbox){
            el = document.createElement('mdc-checkbox');
        }
        if (node instanceof tapc.tapcButton){
            el = document.createElement('button');
        }
        if (el){
            // Add attribute and event handlers
            for (let prop in node) {
                if (node.hasOwnProperty(prop)){
                    let value = node[prop];
                    //if (value && ((match = attrRegExp.exec(prop)) || (match = privateAttrRegExp.exec(prop)) )){
                    if (value && (match = attrRegExp.exec(prop))){
                        // If the attribute value starts with '@', then bind it, 
                        // otherwise use literal value
                        if (bindMatch = bindRegExp.exec(value)){
                            el.setAttribute(window.TapFx.Utilities.camelCaseToHyphen(`${match[1]}.bind`), bindMatch[1]);
                        }else{
                            el.setAttribute(window.TapFx.Utilities.camelCaseToHyphen(match[1]), node[prop]);
                        }
                    }
                    if (value && (match = eventRegExp.exec(prop))){
                        el.setAttribute(`${match[1]}.delegate`, node[prop]);
                    }
                }
            }

            // Also check the prototype because getters are defined there
            if (Object.getPrototypeOf(node)){
                Object.getOwnPropertyNames(Object.getPrototypeOf(node)).forEach((prop) => {
                    el = el as HTMLElement;
                    if (Reflect.has(node, prop)){
                        let value = node[prop];
                        //if (value && ((match = attrRegExp.exec(prop)) || (match = privateAttrRegExp.exec(prop)) )){
                        if (value && (match = attrRegExp.exec(prop))){
                            // If the attribute value starts with '@', then bind it, 
                            // otherwise use literal value
                            if (bindMatch = bindRegExp.exec(value)){
                                el.setAttribute( window.TapFx.Utilities.camelCaseToHyphen(`${match[1]}.bind`), bindMatch[1]);
                            }else{
                                el.setAttribute(window.TapFx.Utilities.camelCaseToHyphen(match[1]), node[prop]);
                            }
                        }
                        if (value && (match = eventRegExp.exec(prop))){
                            el.setAttribute(`${match[1]}.delegate`, node[prop]);
                        }

                    }
                });

            }

            // Recursively parse any content
            if (node instanceof tapcBaseContainer){  
                for(let i = 0; i < node.content.length; i++){
                    this.parseNode(el, node.content[i]);
                }
            }
        }

        if (el)
            parent.appendChild(el);
    }
}

export default BladeParser;
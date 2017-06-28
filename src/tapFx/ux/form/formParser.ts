import * as tapc from './formModules'
import {tapcBase} from './components/tapcBase'
import {tapcBaseContainer} from './components/tapcBaseContainer'

export class formParser{

    constructor(){

    }

    public static parseFormToHTML(form: tapc.tapcForm): string {
        let htmlForm: HTMLTemplateElement = document.createElement("template");
        // Can't get innerHtml or outerHtml property from template element,
        // so use a temp div element as the parent
        let parent: HTMLDivElement = document.createElement('div');
        for(let i = 0; i < form.content.length; i++){
            let el = this.parseNode(parent, form.content[i]);
        }

        return `<template>${parent.innerHTML}</template>`;
    }

    public static parseNode(parent: Element, node: tapcBase): void {
        let attrRegExp: RegExp = /^attribute(.*)/;
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
            parent.innerHTML = node.attributeText;
        }
        if (node instanceof tapc.tapcTapTestComponent){
            el = document.createElement('tap-test-component');
        }
        if (node instanceof tapc.tapcMdcCheckbox){
            el = document.createElement('mdc-checkbox');
        }
        if (el){
            for (let prop in node) {
                if (node.hasOwnProperty(prop)){
                    let value = node[prop];
                    if (value && (match = attrRegExp.exec(prop))){
                        // If the attribute value starts with '@', then bind it, 
                        // otherwise use literal value
                        if (bindMatch = bindRegExp.exec(value)){
                            el.setAttribute( this.camelCaseToHyphen(`${match[1]}.bind`), bindMatch[1]);
                        }else{
                            el.setAttribute(this.camelCaseToHyphen(match[1]), node[prop]);
                        }
                    }
                }
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

    private static camelCaseToHyphen(input: string): string {
        input = input.charAt(0).toLowerCase() + input.slice(1);
        if (/([A-Z]+)/.exec(input))
            return input.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
        else
            // If there are no capital letters, just return input
            return input.toLowerCase();
    }
}
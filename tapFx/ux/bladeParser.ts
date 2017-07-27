import { inject } from 'aurelia-framework'
import * as tapc from './tapcModules'
import {IBaseElement} from './components/BaseElement'
import {BaseElementContainer} from './components/BaseElementContainer'
import BaseBlade from './viewModels/viewModels.baseBlade'
import ConventionEngine from './conventionEngine'
import Utilities from './../utilities/utilities'

const attrRegExp: RegExp = /^attribute(.*)/;
const privateAttrRegExp: RegExp = /^_attribute(.*)/;
const eventRegExp: RegExp = /^event(.*)/;
const bindRegExp = /^@(.*)/;

@inject(ConventionEngine, Utilities)
export class BladeParser {
    constructor(
        private _conventionEngine: ConventionEngine,
        private _utilities: Utilities
    ) {

    }

    /**
     * Parse the passed blade into an HTML template.
     * @param blade 
     * @param bladeFunctions 
     */
    public parseBladeToHTML(blade: BaseBlade, bladeFunctions: string[]): string {
        // Can't get innerHtml or outerHtml property from template element,
        // so use a div element as the parent with the 'blade' class added
        let parent: HTMLDivElement = document.createElement('div');
        parent.classList.add('blade');

        // POC: Could render different types of blades differently
        /*if (blade instanceof FormBlade) {

        }*/
        let bladeContent = blade.content;
        for (let i = 0; i < bladeContent.length; i++) {
            let el = this.parseNode(parent, bladeContent[i]);
        }

        // use the convention engine to attach click handlers
        this._conventionEngine.attachClickHandlers(parent, bladeFunctions);

        return `<template>${parent.outerHTML}</template>`;
    }

    /**
     * Parse a tap component node and add the appropriate element to the passed parent.
     * @param parent 
     * @param node 
     */
    public parseNode(parent: Element, node: IBaseElement): void {
        let bindMatch: RegExpExecArray | null;
        let el: HTMLElement | null = null; 

        if (node instanceof tapc.Heading) {
            el = document.createElement('h' + node.importance);
        }
        if (node instanceof tapc.Content) {
            el = document.createElement('div');
        }
        if (node instanceof tapc.Form) {
            el = document.createElement('form');
        }
        if (node instanceof tapc.Label) {
            el = document.createElement('label');
        }
        if (node instanceof tapc.Select) {
            el = document.createElement('select');
        }
        if (node instanceof tapc.Option) {
            el = document.createElement('option');
        }
        if (node instanceof tapc.Input) {
            el = document.createElement('input');
        }
        if (node instanceof tapc.Image) {
            el = document.createElement('image');
        }
        if (node instanceof tapc.Icon) {
            el = document.createElement('span');
        }
        if (node instanceof tapc.Text) {
            let textNode = document.createTextNode(node.text);
            if (bindMatch = bindRegExp.exec(node.text))
                textNode.data = '${'+ bindMatch[1] + '}';
            parent.appendChild(textNode);
        }
        if (node instanceof tapc.TapTestComponent) {
            el = document.createElement('tap-test-component');
        }
        if (node instanceof tapc.DataTable) {
            let dataTable = node as tapc.DataTable;
            if (!dataTable.attributeColumnConfiguration)
                throw new Error(`Column configuration must be set on tapcDataTable`);
            el = document.createElement('tap-data-table');
        }
        if (node instanceof tapc.MdcCheckbox) {
            el = document.createElement('mdc-checkbox');
        }
        if (node instanceof tapc.Button) {
            el = document.createElement('button');
        }
        if (el) {
            // Add attribute and event handlers
            for (let prop in node) {
                if (node.hasOwnProperty(prop)) {
                    this._setAttributes(el, node, prop);
                }
            }

            // Also check the prototype because getters are defined there
            if (Object.getPrototypeOf(node)) {
                Object.getOwnPropertyNames(Object.getPrototypeOf(node)).forEach((prop) => {
                    el = el as HTMLElement;
                    if (Reflect.has(node, prop)) {
                        this._setAttributes(el, node, prop);
                    }
                });

            }

            // Recursively parse any content
            if (node instanceof BaseElementContainer) {  
                for (let i = 0; i < node.content.length; i++) {
                    this.parseNode(el, node.content[i]);
                }
            }
        }

        if (el)
            parent.appendChild(el);
    }

    /**
     * Set attributes on the HTMLElement based on certain criteria.
     * @param el 
     * @param node 
     * @param prop 
     */
    private _setAttributes(el: HTMLElement, node: IBaseElement, prop: string): void {
        let match: RegExpExecArray | null;
        let bindMatch: RegExpExecArray | null;
        let value = node[prop];
        // TODO: support attributes without values, like form's 'novalidate'
        //if (value && ((match = attrRegExp.exec(prop)) || (match = privateAttrRegExp.exec(prop)) )){
        if (value && (match = attrRegExp.exec(prop))) {
            let attribute = this._utilities.camelCaseToHyphen(match[1]);
            // If the attribute value starts with '@', then bind it,
            // else if, check for the repeat attribute
            // otherwise use literal value
            if (bindMatch = bindRegExp.exec(value)) {
                el.setAttribute(`${attribute}.bind`, bindMatch[1]);
            } else if (attribute === 'repeat') {
                el.setAttribute(`${attribute}.for`, value);
            } else {
                el.setAttribute(attribute, value);
            }
        }
        if (value && (match = eventRegExp.exec(prop))) {
            el.setAttribute(`${match[1]}.delegate`, value);
        }
    }
}

export default BladeParser;
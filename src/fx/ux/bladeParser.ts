import { inject } from 'aurelia-framework';
import * as tapc from './tapcModules';
import { tapcBase } from './components/tapcBase';
import { tapcBaseContainer } from './components/tapcBaseContainer';
import { BaseBlade } from './viewModels/viewModels.baseBlade';
import { ConventionEngine } from './conventionEngine';
import { Utilities } from './../utilities/utilities';

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

        // add a remove blade button with the 'removeBladeButton' class added
        let removeBladeButton = document.createElement('button');
        removeBladeButton.classList.add('removeBladeButton', 'btn', 'btn-primary');
        removeBladeButton.name = 'remove';
        removeBladeButton.textContent = 'Remove';
        //removeBladeButton.attributes.setNamedItem(styleAttr);
        parent.appendChild(removeBladeButton);


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
    public parseNode(parent: Element, node: tapcBase): void {
        let bindMatch: RegExpExecArray | null;
        let el: HTMLElement | null = null; 

        if (node instanceof tapc.tapcHeading) {
            el = document.createElement('h' + node.importance);
        }
        if (node instanceof tapc.tapcDiv) {
            el = document.createElement('div');
        }
        if (node instanceof tapc.tapcForm) {
            el = document.createElement('form');
        }
        if (node instanceof tapc.tapcLabel) {
            el = document.createElement('label');
        }
        if (node instanceof tapc.tapcSelect) {
            el = document.createElement('select');
        }
        if (node instanceof tapc.tapcOption) {
            el = document.createElement('option');
        }
        /*if (node instanceof tapc.tapcLineBreak) {
            el = document.createElement('br');
        }*/
        if (node instanceof tapc.tapcInput) {
            el = document.createElement('input');
        }
        if (node instanceof tapc.tapcText) {
            let textNode = document.createTextNode(node.text);

            bindMatch = bindRegExp.exec(node.text);
            if (bindMatch) {
                textNode.data = '${' + bindMatch[1] + '}';
            }

            parent.appendChild(textNode);
        }
        if (node instanceof tapc.tapcTapTestComponent) {
            el = document.createElement('tap-test-component');
        }
        if (node instanceof tapc.tapcDataTable) {
            let dataTable = node as tapc.tapcDataTable;
            
            if (!dataTable.attributeColumnConfiguration) {
                throw new Error(`Column configuration must be set on tapcDataTable`);
            }

            el = document.createElement('tap-data-table');
        }
        if (node instanceof tapc.tapcMdcCheckbox) {
            el = document.createElement('mdc-checkbox');
        }
        if (node instanceof tapc.tapcButton) {
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
            if (node instanceof tapcBaseContainer) {  
                for (let i = 0; i < node.content.length; i++) {
                    this.parseNode(el, node.content[i]);
                }
            }
        }

        if (el) {
            parent.appendChild(el);
        }
    }

    /**
     * Set attributes on the HTMLElement based on certain criteria.
     * @param el 
     * @param node 
     * @param prop 
     */
    private _setAttributes(el: HTMLElement, node: tapcBase, prop: string): void {
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

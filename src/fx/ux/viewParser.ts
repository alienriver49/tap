import { inject } from 'aurelia-framework';
import * as tapc from './tapcModules';
import { IBaseElement } from './components/baseElement';
import { BaseElementContainer } from './components/baseElementContainer';
import { BaseView } from './view-models/viewModels.baseView';
import { ConventionEngine } from './conventionEngine';
import { Utilities } from '../utilities/utilities';

// const attrRegExp: RegExp = /^attribute(.*)/;
// const privateAttrRegExp: RegExp = /^_attribute(.*)/;
// const eventRegExp: RegExp = /^event(.*)/;
const bindRegExp = /^@(.*)/;

@inject(ConventionEngine, Utilities)
export class ViewParser {
    constructor(
        private _conventionEngine: ConventionEngine,
        private _utilities: Utilities
    ) {

    }

    // A map of the viewnames and views that have already been parsed
    public parsedViewMap: Map<string, string> = new Map<string, string>();

    public getParsedViewNames(): Set<string> {
        const viewMap = (this.parsedViewMap || new Map<string, string>());
        return new Set<string>(Array.from(viewMap.keys()));
    }

    /**
     * Parse the passed view into an HTML template.
     * @param view 
     * @param viewFunctions 
     */
    public parseViewToHTML(view: BaseView, viewFunctions: string[]): string {
        if (!view.content || view.content.length === 0) {
            return '';
        }

        // If view has already been parsed, return empty string
        if (this.parsedViewMap.has(view.viewName)) {
            return '';
        }

        // Can't get innerHtml or outerHtml property from template element,
        // so use a div element as the parent
        const parent: HTMLDivElement = document.createElement('div');

        if (view.isBlade) {
            // Add blade class for blade views
            parent.classList.add('blade');
        }

        const viewContent = view.content;
        for (const baseElement of viewContent) {
            this.parseNode(parent, baseElement);
        }

        // use the convention engine to attach click handlers
        this._conventionEngine.attachConventions(parent, view, viewFunctions);

        const result = `<template>${parent.outerHTML}</template>`;
        this.parsedViewMap.set(view.viewName, result);
        return result;
    }

    /**
     * Parse a tap component node and add the appropriate element to the passed parent.
     * @param parent 
     * @param node 
     */
    public parseNode(parent: Element, node: IBaseElement): void {
        let bindMatch: RegExpExecArray | null;
        let el: HTMLElement | null = null; 
        const skipAttributeAssignment: boolean = false;

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
        if (node instanceof tapc.List) {
            const list = node as tapc.List;
            if (list.isOrdered && !list.attributeRepeat) {
                el = document.createElement('ol');
            } else {
                el = document.createElement('ul');
            }

            // Special handling for repeats
            if (list.attributeRepeat) {
                if (!list.content || list.content.length !== 1) {
                    throw new Error(`When using repeat with a List, the list must contain 1 child element`);
                }
                // repeat-for goes on the <li> node
                const li = document.createElement('li');
                li.setAttribute(`repeat.for`, list.attributeRepeat);
                el.appendChild(li);
                el.style.listStyle = 'none';
                // now add the content as the template
                this.parseNode(li, node.content[0]);
                // Clear repeat and content, so it doesn't interfere with remaining logic
                list.attributeRepeat = '';
                list.content = [];
            }
        }
        if (node instanceof tapc.ListItem) {
            el = document.createElement('li');
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
        // note: we may want a general use "span" component, if that is the case, Icon would just use that during creation
        if (node instanceof tapc.Icon) {
            el = document.createElement('span');
        }
        if (node instanceof tapc.Link) {
            el = document.createElement('a');
        }
        if (node instanceof tapc.TextArea) {
            el = document.createElement('textarea');
        }
        if (node instanceof tapc.Button) {
            el = document.createElement('button');
        }
        if (node instanceof tapc.Text) {
            // TODO add support for multiple interpolations (@ symbols) in the text
            const textNode = document.createTextNode(node.text);
            bindMatch = bindRegExp.exec(node.text);
            if (bindMatch) {
                textNode.data = '${' + bindMatch[1] + '}';
            }
            parent.appendChild(textNode);
        }
        if (node instanceof tapc.TapTestComponent) {
            el = document.createElement('tap-test-component');
        }
        if (node instanceof tapc.DataTable) {
            const dataTable = node as tapc.DataTable;
            if (!dataTable.attributeColumnConfiguration) {
                throw new Error(`Column configuration must be set on tapcDataTable`);
            }

            el = document.createElement('tap-data-table');
        }
        if (node instanceof tapc.MdcCheckbox) {
            el = document.createElement('mdc-checkbox');
        }
        if (node instanceof tapc.Compose) {
            const compose = node as tapc.Compose;
            if (this._utilities.isNullOrWhiteSpace(compose.attributeViewName) ||
                this._utilities.isNullOrWhiteSpace(compose.attributeViewModel)) {
                throw new Error(`All Compose components must have a ViewName and ViewModel value`);
            }
            el = document.createElement('compose');
        }
        if (el && !skipAttributeAssignment) {
            // Add attribute and event handlers
            for (const prop in node) {
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
                for (const baseElement of node.content) {
                    this.parseNode(el, baseElement);
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
    private _setAttributes(el: HTMLElement, node: IBaseElement, prop: string): void {
        let match: string | undefined;
        let bindMatch: RegExpExecArray | null;
        const value = node[prop];
        // TODO: support attributes without values, like form's 'novalidate'
        // Use property metadata to identify properties for attributes and events
        match = node.getAttributeName(prop);
        if (value && match && match !== void(0)) {
            const isRepeatFor = node.isRepeatFor(prop);
            const attribute = this._utilities.camelCaseToHyphen(match);
            // If the attribute value starts with '@', then bind it,
            // else if, check for the repeat attribute
            // otherwise use literal value
            bindMatch = bindRegExp.exec(value);

            if (bindMatch) {
                el.setAttribute(`${attribute}.bind`, bindMatch[1]);
            } else if (isRepeatFor) {
                el.setAttribute(`${attribute}.for`, value);
            } else {
                el.setAttribute(attribute, value);
            }
        }

        match = node.getEventName(prop);
        
        if (value && match && match !== void(0)) {
            el.setAttribute(`${match}.delegate`, value);
        }

        if (node.hasSpecialHandling(prop)) {
            // TODO: temorary way to add a quick border around a container
            if (prop === 'hasBorder' && node[prop] === true) {
                el.classList.add('dmf-border');
            }
        }
    }
}

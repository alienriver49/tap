import {BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig} from './BaseElementContainer'

export interface ILabelConfig extends IBaseElementContainerConfig {
    for?: string;
    value?: string;
}

export interface ILabel extends IBaseElementContainer {
    attributeFor: string;
    attributeValue: string;
}

/**
 * Label UX component for labeling an input element.
 */
export class Label extends BaseElementContainer implements ILabel {
    constructor(config?: ILabelConfig) {
        super(config);
        if (config && typeof config === 'object') {
            this.attributeFor = config.for || '';
            this.attributeValue = config.value || '';
        }
    }

    attributeFor: string;
    attributeValue: string;
}

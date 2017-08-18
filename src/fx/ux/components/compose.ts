import { BaseElement, IBaseElement, IBaseElementConfig } from './baseElement';
import { AttributeMetadata } from '../metadata/attributeMetadata';

export interface IComposeConfig extends IBaseElementConfig {
    viewName?: string;
    viewModel?: string;
}

/**
 * Input UX component for taking input from the user.
 */
export class Compose extends BaseElement {
    constructor(config?: IComposeConfig) {
        if (config === void 0) { 
            config = {}; 
        }

        super(config);
        this.attributeViewName = config.viewName || '';
        this.attributeViewModel = config.viewModel || '';
    }

    @AttributeMetadata.set('view')
    public attributeViewName: string;

    @AttributeMetadata.set('viewModel')
    public attributeViewModel: string;
}

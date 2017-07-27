import {BaseElementContainer, IBaseElementContainer, IBaseElementContainerConfig} from './BaseElementContainer'
import {IImage} from './Image'

export interface IIconConfig extends IBaseElementContainerConfig {
    
}

export interface IIcon extends IBaseElementContainer {
    content: IImage[]
}

const DefaultIconClass: string = 'glyphicon';

/**
 * Icon UX component. This can be an image or an icon from a font.
 */
export class Icon extends BaseElementContainer implements IIcon {
    constructor(config?: IIconConfig) {
        if (config === void 0) { config = {}; }
        super(config);

        if (this.content.length === 0) {
            this.addClass(DefaultIconClass);
        }
    }

    content: IImage[]
}

import { IBaseElement } from '../components/baseElement';
import * as tapc from '../tapcModules';
import { IButton } from '../components/button';
import * as tapm from '../../metadata/metadata';
import { Utilities } from '../../utilities/utilities';
import { BaseView, IBaseView } from './viewModels.baseView';

export interface IBaseBlade extends IBaseView {
    title: string;
    subtitle: string;

    canActivate?(): boolean | Promise<boolean>;
    activate?(): Promise<void> | void;
    canDeactivate?(): boolean | Promise<boolean>;
    deactivate?(): Promise<void> | void;

    addMenu(...munuItems: IButton[]);
}


// TODO: research extending BaseElementContainer, since we already have content: IBaseElement[] and we want the blade to be an actual element on the page anyway (like a div), it might add functionality. would want to research the integration with viewParser
export class BaseBlade extends BaseView implements IBaseBlade {
    constructor() {
        super();
        this.isBlade = true;
        this.content.push(
            new tapc.Button({name: 'remove', class: 'removeBladeButton'}).addClass(tapc.ButtonClass.DANGER).addIcon('glyphicon-remove'),
            new tapc.Heading({name: 'title', importance: 2 }).addText('@title'),
            new tapc.Heading({name: 'subtitle', importance: 3 }).addText('@subtitle')
        );
    }

    public title: string;
    public subtitle: string;

    public canActivate?(): boolean | Promise<boolean>;
    public activate?(): Promise<void> | void;
    public canDeactivate?(): boolean | Promise<boolean>;
    public deactivate?(): Promise<void> | void;

    /**
     * Add a blade menu to the blade.
     * @param munuItems 
     */
    public addMenu(...munuItems: IButton[]) {
        this.content.push(
            new tapc.Content().addClass('blade-menu').addToContainer(
                ...munuItems
            )
        );
    }

    /**
     * Add blade menu content to the blade.
     * @param munuContent 
     */
    public addMenuContent(...munuContent: IBaseElement[]) {
        this.content.push(
            new tapc.Content().addClass('blade-menu-content').addToContainer(
                ...munuContent
            )
        );
    }
}

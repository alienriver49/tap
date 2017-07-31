import {IBaseElement} from './../components/BaseElement'
import * as tapc from './../tapcModules'
import {IButton} from './../components/Button'
import * as tapm from './../../metadata/metadata'

export interface IBaseBlade {
    title: string;
    subtitle: string;
    content: IBaseElement[];

    canActivate?(): boolean|Promise<boolean>;
    activate?(): Promise<void>|void;
    canDeactivate?():boolean|Promise<boolean>;
    deactivate?(): Promise<void>|void;

    addMenu(...munuItems: IButton[]);
}

// TODO: research extending BaseElementContainer, since we already have content: IBaseElement[] and we want the blade to be an actual element on the page anyway (like a div), it might add functionality. would want to research the integration with bladeParser
export class BaseBlade implements IBaseBlade {
    constructor() {
        this.content.push(
            new tapc.Button({name: 'remove', class: 'removeBladeButton btn-danger'}).addIcon('glyphicon-remove'),
            new tapc.Heading({name: 'title', importance: 2 }).addText('@title'),
            new tapc.Heading({name: 'subtitle', importance: 3 }).addText('@subtitle')
        );
    }

    title: string;
    subtitle: string;
    // TODO: how can we make this limited to the developers?
    // Use a getter/setter for this and check the RpcClient.InstanceId?
    @tapm.tapmNoObserve()
    content: IBaseElement[] = [];

    canActivate?(): boolean|Promise<boolean>;
    activate?(): Promise<void>|void;
    canDeactivate?():boolean|Promise<boolean>;
    deactivate?(): Promise<void>|void;

    /**
     * Add a blade menu to the blade.
     * @param munuItems 
     */
    addMenu(...munuItems: IButton[]) {
        this.content.push(
            new tapc.Content().addClass('blade-menu').addToContainer(
                ...munuItems
            )
        )
    }
}
import { IBaseElement } from './../components/BaseElement';
import * as tapc from './../tapcModules';
import { IButton } from './../components/Button';
import * as tapm from './../../metadata/metadata';
import { Utilities } from './../../utilities/utilities';

export interface IBaseBlade {
    title: string;
    subtitle: string;
    content: IBaseElement[];

    canActivate?(): boolean | Promise<boolean>;
    activate?(): Promise<void> | void;
    canDeactivate?(): boolean | Promise<boolean>;
    deactivate?(): Promise<void> | void;

    addMenu(...munuItems: IButton[]);

    // Name and Of are used together to simulate nameof functionality
    // similar to C#
    // EX: this.Name(this.Of(() => this.address.line1));
    Name(fnString: string): string;
    Of(fn: any): string;
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

    public Of = Utilities.Of;
    public Name = Utilities.Name;

    public title: string;
    public subtitle: string;
    // TODO: how can we make this limited to the developers?
    // Use a getter/setter for this and check the RpcClient.InstanceId?
    @tapm.tapmNoObserve()
    public content: IBaseElement[] = [];

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

import {IBaseElement} from './../components/BaseElement'
import {Button} from './../components/Button'
import {Heading} from './../components/Heading'

// TODO: look into extending BaseElementContainer, since we already have content: IBaseElement[] and we want the blade to be an actual element on the page anyway (like a div). would want to research the integration with bladeParser
export class BaseBlade /*extends BaseElementContainer*/ {
    constructor() {
        this.content.push(
            new Button({name: 'remove', class: 'removeBladeButton btn-primary'}).addIcon('glyphicon-remove').addText(' Remove'),
            new Heading({name: 'title', importance: 2 }).addText('@title'),
            new Heading({name: 'subtitle', importance: 3 }).addText('@subtitle')
        );
    }

    title: string;
    subtitle: string;
    // TODO: how can we make this limited to the developers?
    content: IBaseElement[] = [];

    canActivate?(): boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    activate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;
    canDeactivate?():boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    deactivate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;

}

export default BaseBlade
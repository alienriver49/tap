import {tapcBase} from './../components/tapcBase'
import {tapcHeading} from './../components/tapcHeading'

// TODO: look into extending tapcBaseContainer, since we already have content: tapcBase[] and we want the blade to be an actual element on the page anyway (like a div). would want to research the integration with bladeParser
export class BaseBlade /*extends tapcBaseContainer*/ {
    constructor() {
        this.content.push(
            new tapcHeading({name: 'title', importance: 2 }).addText('@title'),
            new tapcHeading({name: 'subtitle', importance: 3 }).addText('@subtitle')
        );
    }

    title: string;
    subtitle: string;
    // TODO: how can we make this limited to the developers?
    content: tapcBase[] = [];

    canActivate?(): boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    activate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;
    canDeactivate?():boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    deactivate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;

}

export default BaseBlade
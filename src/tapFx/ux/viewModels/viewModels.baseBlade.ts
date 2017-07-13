import {tapcBase} from './../components/tapcBase'

class BaseBlade {
    constructor() { }

    title: string;
    subtitle: string;
    content: tapcBase[] = [];

    canActivate?(): boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    activate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;
    canDeactivate?():boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    deactivate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;
}

export default BaseBlade
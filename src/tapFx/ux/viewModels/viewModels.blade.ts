class Blade {
    constructor() { }

    title: string;
    subtitle: string;

    canActivate?(): boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    activate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;
    canDeactivate?():boolean|Promise<boolean>/*|PromiseLike<boolean>*/;
    deactivate?(): Promise<void>/*|PromiseLike<void>|IObservable*/|void;
}

export default Blade
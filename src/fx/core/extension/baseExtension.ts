import { BaseBlade } from '../../ux/viewModels/viewModels.baseBlade'; // type only

export class BaseExtension {
    constructor() { }

    /**
     * Whether journey is on for this extension. If true, blades will stack next to each other. Otherwise, blades will replace the previous blade.
     * @default true
     */
    public journeyOn: boolean = true;

    /**
     * Function for handling the updating of URL params and query params.
     */
    public updateParams?(params: any[], queryParams: object): void;
}

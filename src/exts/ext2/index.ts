import { LandingBlade } from './landingBlade';
import { BaseBlade } from './../../fx/ux/viewModels/viewModels.baseblade'; // TODO: remove this and use a typing
import { getTapFx, BaseExtension } from 'tap-fx';

export class Index extends BaseExtension {
    constructor(
    ) {
        super();
        this._tapFx = getTapFx();
    }

    private _tapFx: ITapFx;

    public init(): void {
        console.log('[EXT-2] Index.init');
        const blade = new LandingBlade();
        this.addBlade(blade, 'landingBlade.html');
    }

    public updateParams(params: any[], queryParams: object): void {
        console.log('[EXT-2] Updating extension parameters.');
    }

    public addBlade(blade: BaseBlade, viewName: string): void {
        console.log('[EXT-2] Attempting to add blade.');
        this._tapFx.Extension.addBlade(blade, viewName);
    }
}

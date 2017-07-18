import LandingBlade from './landingBlade'
import {getTapFx, BaseExtension} from './../tapFx'

export class Index extends BaseExtension {
    constructor(
    ) {
        super();
        this._tapFx = getTapFx();
    }

    private _tapFx: ITapFx;

    public init(): void {
        console.log('[EXT-3] Index.init');
        let blade = new LandingBlade();
        this.addBlade(blade, "landingBlade.html");
    }

    public updateParams(params: any[], queryParams: Object): void {
        console.log('[EXT-3] Updating extension parameters.');
    }

    public addBlade(blade: LandingBlade, viewName: string): void {
        console.log('[EXT-3] Attempting to add blade.');
        this._tapFx.Extension.addBlade(blade, viewName);
    }
}
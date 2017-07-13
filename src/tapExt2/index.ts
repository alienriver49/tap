/// <reference path="./../typings.d.ts" />
import LandingBlade from './landingBlade'
import BaseBlade from './../tapFx/ux/viewModels/viewModels.baseblade'

export class Index extends window.TapFx.BaseExtension {
    constructor(
    ) {
        super();
    }

    public init(): void {
        console.log('[EXT-2] Index.init');
        let blade = new LandingBlade();
        this.addBlade(blade, "landingBlade.html");
    }

    public updateParams(params: any[], queryParams: Object): void {
        console.log('[EXT-2] Updating extension parameters.');

    }

    public addBlade(blade: BaseBlade, viewName: string): void {
        console.log('[EXT-2] Attempting to add blade.');
        window.TapFx.Extension.addBlade(blade, viewName);
    }
}
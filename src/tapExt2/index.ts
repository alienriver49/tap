import LandingBlade from './landingBlade'
import BaseBlade from './../tapFx/ux/viewModels/viewModels.baseblade'; // TODO: remove this and use a typing

let tapFx = window.TapFx;

export class Index extends tapFx.BaseExtension {
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
        tapFx.Extension.addBlade(blade, viewName);
    }
}
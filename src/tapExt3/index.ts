import LandingBlade from './landingBlade'

let tapFx = window.TapFx;

export class Index extends tapFx.BaseExtension {
    constructor(
    ) {
        super();
    }

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
        tapFx.Extension.addBlade(blade, viewName);
    }
}
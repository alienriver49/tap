/// <reference path="./../typings.d.ts" />
import LandingBlade from './landingBlade'

export class Index {
    constructor(
    ) {
        
    }

    public init(): void {
        console.log('[EXT-3] Index.init');
        let blade = new LandingBlade();
        blade.title = 'Title';
        blade.titleChanged(blade.title, "");
        this.addBlade(blade, "landingBlade.html");
    }

    public updateParams(params: any[], queryParams: Object): void {
        console.log('[EXT-3] Updating extension parameters.');
    }

    public addBlade(blade: LandingBlade, viewName: string): void {
        console.log('[EXT-3] Attempting to add blade.');
        window.TapFx.Extension.addBlade(blade, viewName);
    }
}
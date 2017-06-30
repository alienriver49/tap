/// <reference path="./../typings.d.ts" />
import LandingBlade from './landingBlade'
import SecondBlade from './secondBlade'
import BaseBlade from './../tapFx/ux/viewModels/viewModels.baseBlade'

export class Index {
    constructor(
    ) {
        
    }

    private _secondBlade: SecondBlade | null;

    public init(): void {
        console.log('[EXT-1] Index.init');
        let blade = new LandingBlade();
        blade.title = 'Title';
        blade.subtitle = 'Subtitle';
        blade.display = blade.title + ' - ' + blade.subtitle;
        this.addBlade(blade, "landingBlade.html");
    }

    public updateParams(params: any[], queryParams: Object): void {
        console.log('[EXT-1] Updating extension parameters.');
        // TODO: develop a way to assist the developer with blade management
        if (params.length > 0) {
            if (!this._secondBlade) {
                this._secondBlade = new SecondBlade();
                this._secondBlade.title = 'Second Blade';
                this._secondBlade.subtitle = 'Params: ' + params.join(', ');
                this._secondBlade.display = this._secondBlade.title + ' - ' + this._secondBlade.subtitle;
                this._secondBlade.queryParams = JSON.stringify(queryParams);
                this.addBlade(this._secondBlade, "secondBlade.html");
            } else {
                this._secondBlade.subtitle = 'Params: ' + params.join(', ');
                this._secondBlade.display = this._secondBlade.title + ' - ' + this._secondBlade.subtitle;
                this._secondBlade.queryParams = JSON.stringify(queryParams);
            }
        } else {
            if (this._secondBlade) {
                window.TapFx.Extension.removeBlade(this._secondBlade);
                this._secondBlade = null;
            }
        }
    }

    public addBlade(blade: BaseBlade, viewName: string): void {
        console.log('[EXT-1] Attempting to add blade.');
        window.TapFx.Extension.addBlade(blade, viewName);
    }
}
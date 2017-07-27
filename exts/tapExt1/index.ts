/// <reference path="./../../typings.d.ts" />
import LandingBlade from './landingBlade'
import SecondBlade from './secondBlade'
import BaseBlade from './../../tapFx/ux/viewModels/viewModels.baseBlade'; // TODO: remove this and use a typing
import {getTapFx, BaseExtension} from 'tap-fx'

export class Index extends BaseExtension {
    constructor(
    ) {
        super();
        this._tapFx = getTapFx();
    }

    private _tapFx: ITapFx;
    private _blades: SecondBlade[] = [];

    public init(): void {
        console.log('[EXT-1] Index.init');
        let blade = new LandingBlade();
        this.addBlade(blade, "landingBlade.html");
    }

    public updateParams(params: any[], queryParams: Object): void {
        console.log('[EXT-1] Updating extension parameters.');

        // if the length of blades is greater than the params, remove those blades
        let removedBlades: BaseBlade[] = [];
        while (this._blades.length > params.length) {
            let blade = this._blades.pop();
            if (blade) removedBlades.push(blade);
        }
        if (removedBlades.length > 0) this._tapFx.Extension.removeBlades(...removedBlades);

        // update blades with any params
        params.forEach((param, index) => {
            let blade = this._blades[index];
            if (blade) {
                blade.subtitle = 'Param: ' + param;
                blade.display = blade.title + ' - ' + blade.subtitle;
                blade.queryParams = JSON.stringify(queryParams);
            }
        });

        // if the length of blades is less than the params, add new blades
        let i = 0;
        while (this._blades.length < params.length) {
            let blade = new SecondBlade();
            blade.subtitle = 'Param: ' + params[this._blades.length];
            blade.display = blade.title + ' - ' + blade.subtitle;
            blade.queryParams = JSON.stringify(queryParams);
            this._blades.push(blade);
            // this timeout is to ensure blades are added in correct order. TODO: this should be built into the framework or shell
            setTimeout(() => {
                this.addBlade(blade, "secondBlade.html");
            }, i * 100);
            i++;
        }
    }

    public addBlade(blade: BaseBlade, viewName: string): void {
        console.log('[EXT-1] Attempting to add blade.');
        this._tapFx.Extension.addBlade(blade, viewName);
    }
}
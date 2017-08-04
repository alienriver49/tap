/// <reference path="./../../typings.d.ts" />
import {AdminConfigBlade} from './adminConfigBlade'
import BaseBlade from './../../tapFx/ux/viewModels/viewModels.baseBlade'; // TODO: remove this and use a typing
import {getTapFx, BaseExtension} from 'tap-fx'

export class Admin extends BaseExtension {
    constructor(
    ) {
        super();
        this._tapFx = getTapFx();
    }

    private _tapFx: ITapFx;

    public init(): void {
        console.log('[Admin] Index.init');
        let blade = new AdminConfigBlade();
        this.addBlade(blade, "landingBlade.html");
    }

    public updateParams(params: any[], queryParams: Object): void {
        console.log('[Admin] Updating extension parameters.');

    }

    public addBlade(blade: BaseBlade, viewName: string): void {
        console.log('[Admin] Attempting to add blade.');
        this._tapFx.Extension.addBlade(blade, viewName);
    }
}
export interface IAddressConfig {
    line1?: string;
    line2?: string;
    town?: string;
    state?: string;
    zip?: string; 
    address?: Address;
}

import { getTapFx, ViewModels } from 'tap-fx';
import * as tapc from '../../fx/ux/tapcModules';

export class Address extends ViewModels.ComposedView {
    private _tapFx: ITapFx;
    public line1: string;
    public line2: string;
    public town: string;
    public state: string;
    public zip: string; 
    public address: Address;

    constructor(config?: IAddressConfig) {
        super();
        if (config === void 0) { 
            config = {}; 
        }
        this.viewName = 'address.html';
        this.line1 = config.line1 || '';
        this.line2 = config.line2 || '';
        this.town = config.town || '';
        this.state = config.state || '';
        this.zip = config.zip || '';
        this._tapFx = getTapFx();
        this._buildContent();
    }

    private onChangeStateClick() {
        this.state = this._makeid();
    }

    private _buildContent(): void {
        this.content.push(
            new tapc.Content().addToContainer(
                new tapc.Content().addText('Displaying View: address.html'),
                new tapc.Content().addText('@line1'),
                new tapc.Content().addText('@town', ', ', '@state', ' ', '@zip'),
                new tapc.Button({name: 'changeState'}).addText('Change state'),
            )
        );
    }

    private _makeid(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let i = 0; i < 2; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}

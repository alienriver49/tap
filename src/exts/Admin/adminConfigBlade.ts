import {getTapFx, ViewModels} from 'tap-fx';
import * as tapc from '../../fx/ux/tapcModules';

export class AdminConfigBlade extends ViewModels.FormBlade {
    title: string;
    subtitle: string;
    display: string;
    authEndpoint: string;
    portalApiUrl: String;

    private _tapFx: ITapFx;

    constructor() {
        super();
        this.viewName = 'adminConfigBlade.html';
        this._tapFx = getTapFx();
        this._buildContent();
    }

    private _buildContent(): void {
        this.addForm().addToContainer(
                new tapc.Content().addToContainer(
                    new tapc.Form().addLabelInput(
                        new tapc.Label({for: 'text'}).addText('Authorization Endpoint:'),
                        new tapc.Input({name: 'text', value: '@authEndpoint'})
                    ),
                    new tapc.Form().addLabelInput(
                        new tapc.Label({for: 'text'}).addText('Portal API URL:'),
                        new tapc.Input({name: 'text', value: '@portalApiUrl'})
                    )
                ),
                new tapc.Content().addToContainer(
                    new tapc.Button({name: 'saveChanges'}).addText('Save'),
                    new tapc.Button({name: 'cancelChanges'}).addText('Cancel')
                )
            );
    }

    /**
     * Blade activation (initialization);
     */
    activate(): void {
        this.title = 'Admin - Config';
        this.subtitle = '';

        // Load the config data
        let value: any = this._tapFx.Configuration.getConfigValue('authorizationEndpoint');
        if (value != undefined)
            this.authEndpoint = value;

        value = this._tapFx.Configuration.getConfigValue('portalApiUrl');
        if (value != undefined)
            this.portalApiUrl = value;
    }

    public onButtonsaveChangesClick(): void {
        console.log('[Admin-Config] saveChanges clicked')
        this._tapFx.Configuration.saveConfig();
    }

    public onButtoncancelChangesClicked(): void {
        console.log('[Admin-Config] cancelChanges clicked')
    }
}
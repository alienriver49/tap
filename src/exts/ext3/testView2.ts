import { Address } from './address';
import { getTapFx, ViewModels } from 'tap-fx';
import * as tapc from '../../fx/ux/tapcModules';

export class TestView2 extends ViewModels.ComposedView {
    private _tapFx: ITapFx;
    public name: string;
    public address: Address;
    public label: string = 'VM2';

    constructor() {
        super();
        this.viewName = 'testView2.html';
        this.name = 'Test view 2';
        this.address = new Address({line1: '123 Easy St', line2: 'Apt 3', town: 'SCHENECTADY', state: 'NY', zip: '12345'}); 
        this._tapFx = getTapFx();
        this._buildContent();
    }

    private onChangeZipClick() {
        this.address.zip = (Math.floor(Math.random() * 90000) + 10000).toString();
    }

    private _buildContent(): void {
        this.content.push(
            new tapc.Content().addToContainer(
                new tapc.Content().addText('Displaying View: 2'),
                new tapc.Content().addText('Displaying ViewModel: ${label}'),
                new tapc.Content().addText('@name'),
                new tapc.Content().addText('@address.line1'),
                new tapc.Content().addText('@address.line2'),
                new tapc.Content().addText('@address.town'),
                new tapc.Content().addText('@address.state'),
                new tapc.Content().addText('@address.zip'),
                new tapc.Button({name: 'changeZip'}).addText('Change Zip'),
                new tapc.Text({text: '(Change zip handler only exists on view model 2)'}),
            )
        );
    }
}

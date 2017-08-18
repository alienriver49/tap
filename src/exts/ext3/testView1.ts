import { Address } from './address';
import { getTapFx, ViewModels } from 'tap-fx';
import * as tapc from '../../fx/ux/tapcModules';

export class TestView1 extends ViewModels.ComposedView {
    private _tapFx: ITapFx;
    public name: string;
    public address: Address;
    public label: string = 'VM1';

    constructor() {
        super();
        this.viewName = 'testView1.html';
        this.name = 'Test view 1';
        this.address = new Address({line1: '100 Main St', town: 'Bangor', state: 'ME', zip: '04401'}); 
        this._tapFx = getTapFx();
        this._buildContent();
    }

    private onChangeNameClick() {
        this.name = this._tapFx.Utilities.newGuid();
    }

    private _buildContent(): void {
        this.content.push(
            new tapc.Content().addToContainer(
                new tapc.Content().addText('Displaying View: 1'),
                new tapc.Content().addText('Displaying ViewModel: ${label}'),
                new tapc.Text({text: '@name'}),
                new tapc.Content().addText('@address.line1'),
                new tapc.Content().addText('@address.town', ', ', '@address.state', ' ', '@address.zip'),
                new tapc.Button({name: 'changeName'}).addText('Change name'),
                new tapc.Text({text: '(Change name handler only exists on view model 1)'}),
                    new tapc.Content({hasBorder: true}).addText('compose within compose').addToContainer(
                        new tapc.Compose({viewName: 'address.html', viewModel: '@address'})
                    ),
            )
        );
    }
}

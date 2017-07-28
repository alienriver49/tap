import * as tapc from './../../tapFx/ux/tapcModules'
import {ITapDataTableColumnConfiguration} from './../../webComponents/dataTable/tap-data-table'
import {School} from './school'
import {Address} from './address'
import {getTapFx, ViewModels} from 'tap-fx'

class LandingBlade extends ViewModels.BaseBlade {
    private _tapFx: ITapFx;
    
    title: string;
    subtitle: string;
    text: string;
    display: string;
    raised: boolean = false;
    clearText: boolean = false;
    address: Address;
    address2: Address;
    columnConfig: ITapDataTableColumnConfiguration[] = [
        {header: 'School', property: 'name'},
        {header: 'Grades', property: 'grades'},
        {header: 'Has Pool', property: 'hasPool'}
    ]
    data: School[];

    constructor() {
        super();
        this._tapFx = getTapFx();
        this._buildContent();
        this._changeDataSet();
        this.address = new Address({line1: '100 Main St', town: 'Portland', state: 'ME', zip: '04102'});
        this.address2 = this.address; 
        this.address.address = this.address2;
        this.address2.address = this.address;
    }
    
    /**
     * Blade activation (initialization);
     */
    activate(): void {
        this.title = 'Extension 3';
        this.subtitle = 'With Common and Material Components';
        this.text = 'Input text'
        this.textChanged(this.title, "");
    }

    private _buildContent(): void {
        this.content.push(
            new tapc.Content().addToContainer(
                new tapc.Content().addToContainer(
                    new tapc.Form().addLabelInput(
                        new tapc.Label({for: 'text'}).addText('Blade text'),
                        new tapc.Input({name: 'text', value: '@text'})
                    ),
                ),
                new tapc.Content().addToContainer(
                    new tapc.Label().addToContainer(
                        new tapc.MdcCheckbox({isChecked: "@raised"}),
                        new tapc.Content().addText('Raise button')
                    ),
                    new tapc.TapTestComponent({display: '@display', clearText: '@clearText', raised: '@raised'})
                ),
                new tapc.Content().addText('Test Address1 child object'),
                new tapc.Content().addText('@address.line1'),
                new tapc.Content().addText('@address.town', ', ', '@address.state', ' ', '@address.zip'),
                new tapc.Content().addText('Test Address2 child object (same object as Address1)'),
                new tapc.Content().addText('@address2.line1'),
                new tapc.Content().addText('@address2.town', ', ', '@address2.state', ' ', '@address2.zip'),
                new tapc.Content().addToContainer(
                    new tapc.Button({name: 'updateChildObject'}).addText('Update property on child object'),
                    new tapc.Button({name: 'changeChildObject'}).addText('Change child object'),
                ),
                new tapc.Content().addText('Test syncing changing array contents and changing array').addToContainer(
                    new tapc.Button({name: 'addData'}).addText('Add row'),
                    new tapc.Button({name: 'removeData'}).addText('Remove row'),
                    new tapc.Button({name: 'changeData'}).addText('Change array'),
                    new tapc.Button({name: 'test'}).addText('Test random array modification by index'),
                ),
                new tapc.DataTable({id: 'test-table', data: '@data'}).setColumnConfiguration(this.columnConfig, '@columnConfig')
            )
        );
    }

    private _updateDisplay() {
        this.display = this.text ? '[ADDED] ' + this.text : '';
    }

    textChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-3] Blade text has changed.');
        this._updateDisplay();
    }

    onButtonAddDataClick(): void {
        if (this._usingDataset1){
            this.data.push(
                new School({
                    name: `School ${this.data.length}`,
                    grades: [1,2,3,4],
                    hasPool: true
                }))
        }else{
            this.data.push(
                new School({
                    name: `[Array 2] School ${this.data.length}`,
                    grades: [5,6,7,8],
                    hasPool: true
                }))
        }
    }

    onButtonRemoveDataClick(): void {
        this.data.pop();
    }

    _usingDataset1: boolean = true;
    onButtonChangeDataClick(): void {
        this._usingDataset1 = !this._usingDataset1;
        this._changeDataSet();
    }

    private _changeDataSet() {
        if (this._usingDataset1){
            this.data = [
                new School({
                    name: 'Holden',
                    grades: [1,2,3,4],
                    hasPool: false 
                }),
                new School({
                    name: 'Glenburn',
                    grades: [5,6,7,8],
                    hasPool: true 
                }),
                new School({
                    name: 'Bangor HS',
                    grades: [9,10,11,12],
                    hasPool: false 
                }),
            ];
        } else {
            this.data = [
                new School({
                    name: 'Eddington',
                    grades: [1,2,3,4],
                    hasPool: true
                }),
                new School({
                    name: 'Holbrook',
                    grades: [5,6,7,8],
                    hasPool: true 
                }),
                new School({
                    name: 'Brewer HS',
                    grades: [9,10,11,12],
                    hasPool: false 
                }),
            ]
        }
    }

    clearTextChanged(newValue: string, oldValue: string): void {
        if (newValue){
            this.text = '';
            this.clearText = false;
        }
    }

    public onButtonTestClick(): void {
        let index = this._tapFx.Utilities.getRandomInt(0, this.data.length-1);
        console.log('Array index change');
        this.data[index] = 
                new School({
                    name: 'Test School ' + this._tapFx.Utilities.getRandomInt(1,100),
                    grades: [9,10,11,12],
                    hasPool: false 
                });
        // console.log('Array push');
        // this.data.push(new School({ name: 'Push School ' + random(1,100), grades: [9,10,11,12], hasPool: false }));
        // console.log('Array pop');
        // this.data.pop();
        // console.log('Array unshift');
        // this.data.unshift(new School({ name: 'Push School ' + random(1,100), grades: [9,10,11,12], hasPool: false }));
        // console.log('Array shift');
        // this.data.shift();
        // console.log('Array splice');
        // this.data.splice(1, 1, new School({ name: 'Push School ' + random(1,100), grades: [9,10,11,12], hasPool: false }));
    }

    _childPropToggle: boolean = true;
    public onButtonUpdateChildObjectClick(): void {
        if (this._childPropToggle)
            this.address.town = 'Bangor';
        else
            this.address.town = 'Portland';
        this._childPropToggle = !this._childPropToggle;
    }

    _childObjToggle: boolean = true;
    public onButtonChangeChildObjectClick(): void {
        if (this._childObjToggle){
            this.address2 = new Address({line1: '370 US Route 1', town: 'Falmouth', state: 'ME', zip: '04096'});
            this.address = this.address2;
        }else{
            this.address2 = new Address({line1: '100 Main St', town: 'Portland', state: 'ME', zip: '04102'});
            this.address = this.address2;
        }
        this._childObjToggle = !this._childObjToggle;
    }
}

export default LandingBlade 
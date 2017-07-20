import * as tapfx from './../tapFx/ux/tapcModules'
import {ITapDataTableColumnConfiguration} from './../webComponents/dataTable/tap-data-table'
import {School} from './school'
import {Address} from './address'
import {ViewModels} from './../tapFx'

class LandingBlade extends ViewModels.BaseBlade {
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
            new tapfx.tapcDiv().addToContainer(
                new tapfx.tapcDiv().addToContainer(
                    new tapfx.tapcForm().addLabelInput(
                        new tapfx.tapcLabel({for: 'text'}).addText('Blade text'),
                        new tapfx.tapcInput({name: 'text', value: '@text'})
                    ),
                ),
                new tapfx.tapcDiv().addToContainer(
                    new tapfx.tapcLabel().addToContainer(
                        new tapfx.tapcMdcCheckbox({isChecked: "@raised"}),
                        new tapfx.tapcDiv().addText('Raise button')
                    ),
                    new tapfx.tapcTapTestComponent({display: '@display', clearText: '@clearText', raised: '@raised'})
                ),
                new tapfx.tapcDiv().addText('Test Address1 child object'),
                new tapfx.tapcDiv().addText('@address.line1'),
                new tapfx.tapcDiv().addText('@address.town', ', ', '@address.state', ' ', '@address.zip'),
                new tapfx.tapcDiv().addText('Test Address2 child object (same object as Address1)'),
                new tapfx.tapcDiv().addText('@address2.line1'),
                new tapfx.tapcDiv().addText('@address2.town', ', ', '@address2.state', ' ', '@address2.zip'),
                new tapfx.tapcDiv().addToContainer(
                    new tapfx.tapcButton({name: 'updateChildObject'}).addText('Update property on child object'),
                    new tapfx.tapcButton({name: 'changeChildObject'}).addText('Change child object'),
                ),
                new tapfx.tapcDiv().addText('Test syncing changing array contents and changing array').addToContainer(
                    new tapfx.tapcButton({name: 'addData'}).addText('Add row'),
                    new tapfx.tapcButton({name: 'removeData'}).addText('Remove row'),
                    new tapfx.tapcButton({name: 'changeData'}).addText('Change array'),
                    new tapfx.tapcButton({name: 'test'}).addText('Test random array modification by index'),
                ),
                new tapfx.tapcDataTable({id: 'test-table', attributeData: '@data'}).setColumnConfiguration(this.columnConfig, '@columnConfig')
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
        let random = (min: number, max: number) => { return Math.floor(Math.random() * (max - min + 1) + min); };
        let index = random(0, this.data.length-1);
        console.log('Array index change');
        this.data[index] = 
                new School({
                    name: 'Test School ' + random(1,100),
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
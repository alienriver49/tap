import * as tapc from '../../fx/ux/tapcModules';
import { ITapDataTableColumnConfiguration } from '../../webComponents/dataTable/tap-data-table';
import { School } from './school';
import { Address } from './address';
import { getTapFx, ViewModels } from 'tap-fx';

export class LandingBlade extends ViewModels.BaseBlade {
    private _tapFx: ITapFx;
    
    public title: string;
    public subtitle: string;
    public text: string;
    public display: string;
    public raised: boolean = false;
    public clearText: boolean = false;
    public address: Address;
    public address2: Address;
    public columnConfig: ITapDataTableColumnConfiguration[] = [
        {header: 'School', property: 'name'},
        {header: 'Grades', property: 'grades'},
        {header: 'Has Pool', property: 'hasPool'}
    ];
    public data: School[];
    public numbers: number[] = [6, 7, 8];    
    public testSet: Set<Address> = new Set<Address>([
        new Address({line1: '1 Maple St', town: 'Portland', state: 'ME', zip: '04102'}),
        new Address({line1: '2 Oak St', town: 'Portland', state: 'ME', zip: '04102'}), 
        new Address({line1: '3 Elm St', town: 'Portland', state: 'ME', zip: '04102'}) 
    ]);
    public dict: Map<string, Address> = new Map<string, Address>([
        ['one', new Address({line1: '1 Maple St', town: 'Portland', state: 'ME', zip: '04102'})],
        ['two', new Address({line1: '2 Oak St', town: 'Portland', state: 'ME', zip: '04102'})], 
        ['three', new Address({line1: '3 Elm St', town: 'Portland', state: 'ME', zip: '04102'})] 
    ]);
    public twoD: number[][] = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

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
    public activate(): void {
        this.title = 'Extension 3';
        this.subtitle = 'With Common and Material Components';
        this.text = 'Input text';
        this.textChanged(this.title, '');
    }

    private _buildContent(): void {
        this.content.push(
            new tapc.Content().addToContainer(
                new tapc.Content().addToContainer(
                    new tapc.Form().addLabelInput(
                        new tapc.Label({for: 'text'}).addText('Blade text'),
                        //new tapc.Input({name: 'text', value:`@text}`})
                        // Example of using Name(Of()) for type safety, although it makes for pretty ugly code
                        new tapc.Input({name: 'text', value: `@${this.Name(this.Of(() => this.text))}`})
                    ),
                ),
                new tapc.Content().addToContainer(
                    new tapc.Label().addToContainer(
                        new tapc.MdcCheckbox({isChecked: '@raised'}),
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
                new tapc.Content().addText('Test syncing changing array contents and changing array ').addToContainer(
                    new tapc.Button({name: 'addData'}).addText('Add row'),
                    new tapc.Button({name: 'removeData'}).addText('Remove row'),
                    new tapc.Button({name: 'changeData'}).addText('Change array'),
                    new tapc.Button({name: 'test'}).addText('Test random array modification'),
                    new tapc.Button({name: 'changeItemProp'}).addText('Change prop on array child object'),
                ),
                new tapc.DataTable({id: 'test-table', data: '@data'}).setColumnConfiguration(this.columnConfig, '@columnConfig'),
                new tapc.Content().addText('Repeat with Map ').addToContainer(
                    new tapc.Button({name: 'addMapData'}).addText('Add element to map'),
                    new tapc.Button({name: 'removeMapData'}).addText('Remove element from map'),
                    new tapc.Button({name: 'changeMapDataValue'}).addText('Change element value in map'),
                    new tapc.Button({name: 'changeMapData'}).addText('Change map object'),
                    new tapc.Button({name: 'clearMapData'}).addText('Clear map'),
                ),
                new tapc.List({name: 'mapTest', repeat: '[key, value] of dict'}).addText('${key}: ${value.line1}'),
                new tapc.Content().addText('Repeat with Set ').addToContainer(
                    new tapc.Button({name: 'addSetData'}).addText('Add element to set'),
                    new tapc.Button({name: 'removeSetData'}).addText('Remove element from set'),
                    new tapc.Button({name: 'changeSetData'}).addText('Change set object'),
                    new tapc.Button({name: 'clearSetData'}).addText('Clear set'),
                ),
                new tapc.List({name: 'setList', repeat: 'value of testSet'}).addText('${value.line1}, ${value.town}'),
                new tapc.Content().addText('List with explicit items'),
                new tapc.List({name: 'listTest'}).addToContainer(
                    new tapc.ListItem().addText('fee'), 
                    new tapc.ListItem().addText('fi'), 
                    new tapc.ListItem().addText('fo'), 
                    new tapc.ListItem().addText('fum'), 
                )
            )
        );
    }

    private _updateDisplay() {
        this.display = this.text ? '[ADDED] ' + this.text : '';
    }

    public textChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-3] Blade text has changed.');
        this._updateDisplay();
    }

    public onAddDataClick(): void {
        if (this._usingDataset1) {
            this.data.push(
                new School({
                    name: `School ${this.data.length}`,
                    grades: [1, 2, 3, 4],
                    hasPool: true
                }));
        } else {
            this.data.push(
                new School({
                    name: `[Array 2] School ${this.data.length}`,
                    grades: [5, 6, 7, 8],
                    hasPool: true
                }));
        }
    }

    public onRemoveDataClick(): void {
        this.data.pop();
    }

    private _usingDataset1: boolean = true;
    public onChangeDataClick(): void {
        this._usingDataset1 = !this._usingDataset1;
        this._changeDataSet();
    }

    private _changeDataSet() {
        if (this._usingDataset1) {
            this.data = [
                new School({
                    name: 'Holden',
                    grades: [1, 2, 3, 4],
                    hasPool: false 
                }),
                new School({
                    name: 'Glenburn',
                    grades: [5, 6, 7, 8],
                    hasPool: true 
                }),
                new School({
                    name: 'Bangor HS',
                    grades: [9, 10, 11, 12],
                    hasPool: false 
                }),
            ];
        } else {
            this.data = [
                new School({
                    name: 'Eddington',
                    grades: [1, 2, 3, 4],
                    hasPool: true
                }),
                new School({
                    name: 'Holbrook',
                    grades: [5, 6, 7, 8],
                    hasPool: true 
                }),
                new School({
                    name: 'Brewer HS',
                    grades: [9, 10, 11, 12],
                    hasPool: false 
                }),
            ];
        }
    }

    public clearTextChanged(newValue: string, oldValue: string): void {
        if (newValue) {
            this.text = '';
            this.clearText = false;
        }
    }

    public onTestClick(): void {
        const index = this._tapFx.Utilities.getRandomInt(0, this.data.length - 1);
        console.log('Array index change');
        this.data.splice(index, 1,  
                new School({
                    name: 'Test School ' + this._tapFx.Utilities.getRandomInt(1, 100),
                    grades: [9, 10, 11, 12],
                    hasPool: false 
                }));
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

    public onChangeItemPropClick(): void {
        const index = this._tapFx.Utilities.getRandomInt(0, this.data.length - 1);
        this.data[index].grades = [23, 24, 25];
        //this.data[index].name = `New Name ${this._tapFx.Utilities.getRandomInt(0, 1000)}`;
    }

    private _childPropToggle: boolean = true;
    public onUpdateChildObjectClick(): void {
        if (this._childPropToggle) {
            this.address.town = 'Bangor';
        } else {
            this.address.town = 'Portland';
        }

        this._childPropToggle = !this._childPropToggle;
    }

    private _childObjToggle: boolean = true;
    public onChangeChildObjectClick(): void {
        if (this._childObjToggle) {
            this.address2 = new Address({line1: '370 US Route 1', town: 'Falmouth', state: 'ME', zip: '04096'});
            this.address2.address = this.address2;
            this.address = this.address2;
        } else {
            this.address2 = new Address({line1: '100 Main St', town: 'Portland', state: 'ME', zip: '04102'});
            this.address = this.address2;
        }
        this._childObjToggle = !this._childObjToggle;
    }

    // add an element to the set
    public onAddSetDataClick(): void {
        const key = this._tapFx.Utilities.getRandomInt(this.testSet.size, 100);
            this.testSet.add(new Address({line1: `${key} New St`, town: 'Portland', state: 'ME', zip: '04102'}));
    }

    // delete first element in the set
    public onRemoveSetDataClick(): void {
        const val = this.testSet.values().next().value;
        this.testSet.delete(val);
    }

    private _setDataToggle: boolean = true;
    public onChangeSetDataClick(): void {
        if (this._setDataToggle) {
            this.testSet = new Set<Address>([
                new Address({line1: '4 Birch St', town: 'Portland', state: 'ME', zip: '04102'}), 
                new Address({line1: '5 Cherry St', town: 'Portland', state: 'ME', zip: '04102'}), 
                new Address({line1: '6 Pine St', town: 'Portland', state: 'ME', zip: '04102'}) 
            ]);
        } else {
            this.testSet = new Set<Address>([
                new Address({line1: '1 Maple St', town: 'Portland', state: 'ME', zip: '04102'}), 
                new Address({line1: '2 Oak St', town: 'Portland', state: 'ME', zip: '04102'}), 
                new Address({line1: '3 Elm St', town: 'Portland', state: 'ME', zip: '04102'}) 
            ]);
        }
        this._setDataToggle = !this._setDataToggle;
    }

    // clear all entries in the set 
    public onClearSetDataClick(): void {
        this.testSet.clear();
    }

    // add an element to the Map
    public onAddMapDataClick(): void {
        let go = true;
        while (go) {
            const key = this._tapFx.Utilities.getRandomInt(this.dict.size, 100);
            if (!this.dict.has(key.toString())) {
                go = false;
                this.dict.set(key.toString(),  new Address({line1: `${key} New St`, town: 'Portland', state: 'ME', zip: '04102'}));
            }
        }
    }

    // delete first element in the Map
    public onRemoveMapDataClick(): void {
        const key: string = this.dict.keys().next().value;
        this.dict.delete(key);
    }

    // clear all entries in the Map
    public onClearMapDataClick(): void {
        this.dict.clear();
    }

    // Change data value on random element in the Map
    public onChangeMapDataValueClick(): void {
        let index = this._tapFx.Utilities.getRandomInt(0, this.dict.size - 1);
        const keys = this.dict.keys();
        let key = keys.next().value;
        while (index) {
            key = keys.next().value;
            index--;
        }
        const stNum = this._tapFx.Utilities.getRandomInt(100, 1000);
        this.dict.set(key,  new Address({line1: `${stNum} Changed St`, town: 'Portland', state: 'ME', zip: '04102'}));
        
    }


    private _mapDataToggle: boolean = true;
    public onChangeMapDataClick(): void {
        if (this._mapDataToggle) {
            this.dict = new Map<string, Address>([
                ['four', new Address({line1: '4 Birch St', town: 'Portland', state: 'ME', zip: '04102'})], 
                ['five', new Address({line1: '5 Cherry St', town: 'Portland', state: 'ME', zip: '04102'})], 
                ['six', new Address({line1: '6 Pine St', town: 'Portland', state: 'ME', zip: '04102'})] 
            ]);
        } else {
            this.dict = new Map<string, Address>([
                ['one', new Address({line1: '1 Maple St', town: 'Portland', state: 'ME', zip: '04102'})], 
                ['two', new Address({line1: '2 Oak St', town: 'Portland', state: 'ME', zip: '04102'})], 
                ['three', new Address({line1: '3 Elm St', town: 'Portland', state: 'ME', zip: '04102'})] 
            ]);
        }
        this._mapDataToggle = !this._mapDataToggle;
    }


}

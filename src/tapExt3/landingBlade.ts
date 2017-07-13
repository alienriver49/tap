import * as tapfx from './../tapFx/ux/tapcModules'
import Utilities from './../tapFx/utilities/utilities'
import {ITapDataTableColumnConfiguration} from './../webComponents/dataTable/tap-data-table'
import {School} from './school'
import {Address} from './address'

class LandingBlade extends window.TapFx.ViewModels.BaseBlade {
    title: string;
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
        this.title = 'Title';
        this.titleChanged(this.title, "");
    }

    private _buildContent(): void {
        this.content.push(new tapfx.tapcLineBreak());
        let div = new tapfx.tapcDiv({id: 'ext3-div'});
        div.content.push(new tapfx.tapcLabel(
            {content: [new tapfx.tapcText({text: 'Extension 3 with common and material components'})]}
        ));
        let inputDiv = new tapfx.tapcDiv({id: 'input-div'})
        inputDiv.content.push(new tapfx.tapcLabel(
            {for: 'title',
             content: [new tapfx.tapcText({text: 'Blade text'})]
            }
        ));
        inputDiv.content.push(new tapfx.tapcInput(
            {type: 'text',
            value: '@title'
            }
        ));
        div.content.push(inputDiv);
        this.content.push(div);
        this.content.push(new tapfx.tapcLineBreak());

        let label2 = new tapfx.tapcLabel();
        label2.content.push(new tapfx.tapcMdcCheckbox({
            isChecked: "@raised"
        }))
        label2.content.push(new tapfx.tapcDiv({
            content: [new tapfx.tapcText({text: 'Raise button'})]
        }));
        this.content.push(label2);
        
        let testComp = new tapfx.tapcTapTestComponent({
            display: '@display',
            clearText: '@clearText',
            raised: '@raised'
        });
        this.content.push(testComp);
        this.content.push(new tapfx.tapcLineBreak());

        this.content.push(new tapfx.tapcText({text: 'Test Address1 child object'}));
        this.content.push(new tapfx.tapcLineBreak());
        this.content.push(new tapfx.tapcText({text: '@address.line1'}));
        this.content.push(new tapfx.tapcLineBreak());
        this.content.push(new tapfx.tapcText({text: '@address.town'}));
        this.content.push(new tapfx.tapcText({text: '@address.state'}));
        this.content.push(new tapfx.tapcText({text: '@address.zip'}));
        this.content.push(new tapfx.tapcLineBreak());
        this.content.push(new tapfx.tapcText({text: 'Test Address2 child object (same object as Address1)'}));
        this.content.push(new tapfx.tapcLineBreak());
        this.content.push(new tapfx.tapcText({text: '@address2.line1'}));
        this.content.push(new tapfx.tapcLineBreak());
        this.content.push(new tapfx.tapcText({text: '@address2.town'}));
        this.content.push(new tapfx.tapcText({text: '@address2.state'}));
        this.content.push(new tapfx.tapcText({text: '@address2.zip'}));
        this.content.push(new tapfx.tapcLineBreak());
        let updateChildObject = new tapfx.tapcButton({
            id: 'update-child-button',
            type: 'button',
            click: 'onUpdateChildObjectClick()',
            content: [new tapfx.tapcText({text: 'Update property on child object'})]
        });
        let changeChildObject = new tapfx.tapcButton({
            id: 'change-child-button',
            type: 'button',
            click: 'onChangeChildObjectClick()',
            content: [new tapfx.tapcText({text: 'Change child object'})]
        });
        let div3 = new tapfx.tapcDiv({
            content: [updateChildObject, changeChildObject]
        })
        this.content.push(div3);
        this.content.push(new tapfx.tapcLineBreak());

        let addButton = new tapfx.tapcButton({
            id: 'add-button',
            type: 'button',
            click: 'onAddButtonClick()',
            content: [new tapfx.tapcText({text: 'Add row'})]
        });
        let removeButton = new tapfx.tapcButton({
            id: 'remove-button',
            type: 'button',
            click: 'onRemoveButtonClick()',
            content: [new tapfx.tapcText({text: 'Remove row'})]
        });
        let changeData = new tapfx.tapcButton({
            id: 'change-data-button',
            type: 'button',
            click: 'onChangeDataClick()',
            content: [new tapfx.tapcText({text: 'Change Array'})]
        });
        let testButton = new tapfx.tapcButton({
            id: 'test-button',
            type: 'button',
            click: 'onTestClick()',
            content: [new tapfx.tapcText({text: 'Test something'})]
        });
        let div2 = new tapfx.tapcDiv({
            content: [addButton, removeButton, changeData, testButton]
        })
        this.content.push(new tapfx.tapcText({text: 'Test syncing changing array contents and changing array'}));
        this.content.push(div2);

        let dataTable = new tapfx.tapcDataTable({
            id: 'test-table',
            attributeData: '@data'
        })
        dataTable.setColumnConfiguration(this.columnConfig, '@columnConfig');
        this.content.push(dataTable);
    }

    private _updateDisplay() {
        this.display = this.title ? '[ADDED] ' + this.title : '';
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-3] Blade title has changed.');
        this._updateDisplay();
    }

    onAddButtonClick(): void {
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

    onRemoveButtonClick(): void {
        this.data.pop();
    }

    _usingDataset1: boolean = true;
    onChangeDataClick(): void {
        this._usingDataset1 = !this._usingDataset1;
        this._changeDataSet();
    }

    private _changeDataSet(){
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
        }else{
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
            this.title = '';
            this.clearText = false;
        }
    }

    public onTestClick(): void {
        this.data[0].name = 'TEST';
    }

    _childPropToggle: boolean = true;
    public onUpdateChildObjectClick(): void {
        if (this._childPropToggle)
            this.address.town = 'Bangor';
        else
            this.address.town = 'Portland';
        this._childPropToggle = !this._childPropToggle;
    }

    _childObjToggle: boolean = true;
    public onChangeChildObjectClick(): void {
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
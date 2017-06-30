import * as tapfx from './../tapFx/ux/form/formModules'
import Utilities from './../tapFx/utilities/utilities'
import {ITapDataTableColumnConfig} from './../webComponents/dataTable/tap-data-table'

class LandingBlade extends window.TapFx.ViewModels.BaseBlade {
    title: string;
    display: string;
    raised: boolean = false;
    clearText: boolean = false;
    headers: ITapDataTableColumnConfig[] = [
        {header: 'School'},
        {header: 'Type'}
    ]
    data: string[][] = [
        ['Eddington', 'k-4'],
        ['Holbrook', '5-8'],
        ['Brewer HS', '9-12']
    ]

    constructor() {
        super();
        this.form =  new tapfx.tapcForm();
        this.form.content.push(new tapfx.tapcLineBreak());
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
         this.form.content.push(div);
        this.form.content.push(new tapfx.tapcLineBreak());

        let label2 = new tapfx.tapcLabel();
        label2.content.push(new tapfx.tapcMdcCheckbox({
            isChecked: "@raised"
        }))
        label2.content.push(new tapfx.tapcDiv({
            content: [new tapfx.tapcText({text: 'Raise button'})]
        }));
        this.form.content.push(label2);
        
        let testComp = new tapfx.tapcTapTestComponent({
            display: '@display',
            clearText: '@clearText',
            raised: '@raised'
        });
        this.form.content.push(testComp);
        this.form.content.push(new tapfx.tapcLineBreak());

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
        let div2 = new tapfx.tapcDiv({
            content: [addButton, removeButton, changeData]
        })
        this.form.content.push(new tapfx.tapcText({text: 'Test syncing changing array contents and changing array'}));
        this.form.content.push(div2);

        let dataTable = new tapfx.tapcDataTable({
            id: 'test-table',
            attributeHeaders: '@headers',
            attributeData: '@data'
        })
        this.form.content.push(dataTable);
    }

    private _updateDisplay() {
        this.display = this.title ? '[ADDED] ' + this.title : '';
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-3] Blade title has changed.');
        this._updateDisplay();
    }

    onAddButtonClick(): void {
        if (this.usingDataset1){
            this.data.push([`School ${this.data.length}`, 'k-5'])
        }else{
            this.data.push([`First Name ${this.data.length}`, 'Last Name'])
        }
    }

    onRemoveButtonClick(): void {
        this.data.pop();
    }

    usingDataset1: boolean = true;
    onChangeDataClick(): void {
        if (this.usingDataset1){
            this.headers = [
                {header: 'First name'},
                {header: 'Last name'}
            ];
            this.data = [
                ['David', 'Foster'],
                ['Brian', 'Jackson'],
                ['Nick', 'Downs']
            ];
        }else{
            this.headers = [
                {header: 'School'},
                {header: 'Type'}
            ];
            this.data = [
                ['Eddington', 'k-4'],
                ['Holbrook', '5-8'],
                ['Brewer HS', '9-12']
            ]
        }
        this.usingDataset1 = !this.usingDataset1;
    }

    clearTextChanged(newValue: string, oldValue: string): void {
        if (newValue){
            this.title = '';
            this.clearText = false;
        }
    }
}

export default LandingBlade 
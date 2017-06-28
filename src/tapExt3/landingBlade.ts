import * as tapfx from './../tapFx/ux/form/formModules'

class LandingBlade extends window.TapFx.ViewModels.Blade {
    title: string;
    display: string;
    raised: boolean = false;
    clearText: boolean = false;

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
    }

    private _updateDisplay() {
        this.display = this.title ? '[ADDED] ' + this.title : '';
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('[EXT-3] Blade title has changed.');
        this._updateDisplay();
    }

    clearTextChanged(newValue: string, oldValue: string): void {
        if (newValue){
            this.title = '';
            this.clearText = false;
        }
    }
}

export default LandingBlade 
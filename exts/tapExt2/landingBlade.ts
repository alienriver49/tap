import {getTapFx, ViewModels} from 'tap-fx'
import * as tapfx from './../../tapFx/ux/tapcModules'

class LandingBlade extends ViewModels.FormBlade {
    title: string;
    subtitle: string;

    buttonConventionDisabled = false;
    showContent = true;

    selectOptions = ['Option 1', 'Option 2', 'Option 3'];
    selectedOption = this.selectOptions[0];

    checkboxes = ['Checkbox 1', 'Checkbox 2', 'Checkbox 3'];
    selectedCheckboxes = [this.checkboxes[0]];

    radios = [
        {value: '1', label: 'Radio 1'},
        {value: '2', label: 'Radio 2'},
        {value: '3', label: 'Radio 3'},
    ];
    selectedRadio = this.radios[0];

    constructor() {
        super();
        this._tapFx = getTapFx();
        this._buildContent();
    }

    private _tapFx: ITapFx;
    
    private _buildContent(): void {
        this.addForm()
                .addToContainer(
                    new tapfx.tapcDiv().addToContainer(
                        new tapfx.tapcButton({name: 'convention', disabled: '@buttonConventionDisabled' }).addText('Convention Button'),
                    )
                )
                .addToContainer(
                    new tapfx.tapcDiv().addToContainer(
                        new tapfx.tapcButton({name: 'clickMe', click: "onButtonClickMeClick('argument 1 being passed to a function', 'argument 2 being passed to a function')" }).addText('Click Me!'),
                    )
                )
                .addLabelInput(
                    new tapfx.tapcLabel({for: 'showContent'}).addToContainer(
                        new tapfx.tapcDiv({if: '@showContent'}).addText('Hide:'),
                        new tapfx.tapcDiv({if: '@!showContent'}).addText('Show:')
                    ),
                    new tapfx.tapcInput({name: 'showContent', type: tapfx.InputType.Checkbox, checked: '@showContent'}),
                )
                .addToContainer(
                    new tapfx.tapcDiv({if: '@showContent'}).addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at pharetra magna, ut sagittis risus. Duis purus massa, vestibulum sed purus sed, facilisis vestibulum nibh. Curabitur rutrum sed mauris eget tincidunt. Phasellus imperdiet sem ac nunc lobortis vehicula id non tellus.')
                )
                .addToContainer(
                    new tapfx.tapcDiv().addToContainer(
                        new tapfx.tapcSelect({value: '@selectedOption'}).addToContainer(
                            new tapfx.tapcOption({name: 'selectOptions', repeat: 'option of selectOptions', model: '@option'}).addText('@option')
                        ),
                        new tapfx.tapcHeading({importance: 4}).addText('Selected Option: ', '@selectedOption')
                    )
                )
                .addToContainer(
                    new tapfx.tapcDiv().addToContainer(
                        new tapfx.tapcDiv({repeat: 'input of checkboxes'}).addToContainer(
                            new tapfx.tapcInput({name: 'checkboxes', type: tapfx.InputType.Checkbox, model: '@input', checked: '@selectedCheckboxes'}),
                            new tapfx.tapcText({text: ' '}),
                            new tapfx.tapcText({text: '@input'})
                        ),
                        new tapfx.tapcHeading({importance: 4}).addText('Selected Checkboxes: ', '@selectedCheckboxes')
                    )
                )
                .addToContainer(
                    new tapfx.tapcDiv().addToContainer(
                        new tapfx.tapcDiv({repeat: 'input of radios'}).addToContainer(
                            new tapfx.tapcInput({name: 'radios', type: tapfx.InputType.Radio, model: '@input', checked: '@selectedRadio'}),
                            new tapfx.tapcText({text: ' '}),
                            new tapfx.tapcText({text: '@input.label'})
                        ),
                        new tapfx.tapcHeading({importance: 4}).addText('Selected Checkboxes: ', '{ value: ', '@selectedRadio.value', ', label: ', '@selectedRadio.label', ' }')
                    )
                );
    }

    /**
     * Blade activation (initialization);
     */
    activate() {
        console.log('[EXT-2] activate method called');
        // fake a timeout for an extension activation
        let timeout: number = 500;
        let promise = new Promise<undefined>((resolve) => {
            this.title = 'Extension 2';
            this.subtitle = 'Form Blade';
            
            setTimeout(resolve, timeout);
        });
        return promise;
    }

    canActivate() {
        console.log('[EXT-2] canActivate method called');
        // fake a timeout for an extension can activate call and return whether an extension can activate
        let retVal: boolean = true;
        let timeout: number = 0;
        let promise = new Promise<boolean>((resolve) => {
            setTimeout(() => { resolve(retVal) }, timeout);
        });
        return promise;
    }

    deactivate() {
        console.log('[EXT-2] deactivate method called');
        // fake a timeout for an extension deactivation
        let timeout: number = 500;
        let promise = new Promise<undefined>((resolve) => {
            setTimeout(resolve, timeout);
        });
        return promise;
    }

    canDeactivate() {
        console.log('[EXT-2] canDeactivate method called');
        // fake a timeout for an extension can deactivate call and return whether an extension can deactivate
        let retVal: boolean = true;
        let timeout: number = 0;
        let promise = new Promise<boolean>((resolve) => {
            setTimeout(() => { resolve(retVal) }, timeout);
        });
        return promise;
    }
    
    onButtonConventionClick() {
        var origSubtitle = this.subtitle;
        this.subtitle = origSubtitle + ' - Convention Button Clicked!';
        this.buttonConventionDisabled = true;

        let user: any = this._tapFx.Security.getUserInfo();
        console.log('[EXT-2] userInfo: ', user);

        setTimeout(() => {
            this.subtitle = origSubtitle;
            this.buttonConventionDisabled = false;
        }, 3000)
    }

    onButtonClickMeClick(arg: any, arg2: any) {
        //alert('Button clicked!\n\nReceived arg:\n' + arg + '\n\nReceived arg2:\n' + arg2);
        console.log('[EXT-2] onButtonClickMeClick arg 1: ' + arg + ' | arg 2: ' + arg2);
        let random = (min: number, max: number) => { return Math.floor(Math.random() * (max - min + 1) + min); };
        this.selectedOption = this.selectOptions[random(0, 2)];
        this.selectedCheckboxes = [this.checkboxes[random(0, 2)]];
        this.selectedRadio = this.radios[random(0, 2)];

        this._tapFx.Http.fetchRequest('https://jsonplaceholder.typicode.com/users/7', {}).then(response => {
            console.log('[EXT-2] response: ', response);
        });
    }
}

export default LandingBlade
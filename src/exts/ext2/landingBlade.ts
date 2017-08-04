import { getTapFx, ViewModels } from 'tap-fx';
import * as tapc from './../../fx/ux/tapcModules';

export class LandingBlade extends ViewModels.FormBlade {
    private _tapFx: ITapFx;
    
    public title: string;
    public subtitle: string;

    public conventionDisabled = false;
    public showContent = true;

    public selectOptions = ['Option 1', 'Option 2', 'Option 3'];
    public selectedOption = this.selectOptions[0];

    public checkboxes = ['Checkbox 1', 'Checkbox 2', 'Checkbox 3'];
    public selectedCheckboxes = [this.checkboxes[0]];

    public radios = [
        {value: '1', label: 'Radio 1'},
        {value: '2', label: 'Radio 2'},
        {value: '3', label: 'Radio 3'},
    ];
    public selectedRadio = this.radios[0];

    constructor() {
        super();
        this._tapFx = getTapFx();
        this._buildContent();
    }
    
    private _buildContent(): void {
        this.addForm()
                .addToContainer(
                    new tapc.Content().addToContainer(
                        new tapc.Button({name: 'convention'}).addText('Convention Button'),
                    )
                )
                .addToContainer(
                    new tapc.Content().addToContainer(
                        new tapc.Button({name: 'clickMe', click: "onClickMeClick('argument 1 being passed to a function', 'argument 2 being passed to a function')" }).addText('Click Me!'),
                    )
                )
                .addLabelInput(
                    new tapc.Label({for: 'showContent'}).addToContainer(
                        new tapc.Content({if: '@showContent'}).addText('Hide:'),
                        new tapc.Content({if: '@!showContent'}).addText('Show:')
                    ),
                    new tapc.Input({name: 'showContent', type: tapc.InputType.CHECKBOX, checked: '@showContent'}),
                )
                .addToContainer(
                    new tapc.Content({if: '@showContent'}).addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at pharetra magna, ut sagittis risus. Duis purus massa, vestibulum sed purus sed, facilisis vestibulum nibh. Curabitur rutrum sed mauris eget tincidunt. Phasellus imperdiet sem ac nunc lobortis vehicula id non tellus.')
                )
                .addToContainer(
                    new tapc.Content().addToContainer(
                        new tapc.Select({value: '@selectedOption'}).addToContainer(
                            new tapc.Option({name: 'selectOptions', repeat: 'option of selectOptions', model: '@option'}).addText('@option')
                        ),
                        new tapc.Heading({importance: 4}).addText('Selected Option: ', '@selectedOption')
                    )
                )
                .addToContainer(
                    new tapc.Content().addToContainer(
                        new tapc.Content({repeat: 'input of checkboxes'}).addToContainer(
                            new tapc.Input({name: 'checkboxes', type: tapc.InputType.CHECKBOX, model: '@input', checked: '@selectedCheckboxes'}),
                            new tapc.Text({text: ' '}),
                            new tapc.Text({text: '@input'})
                        ),
                        new tapc.Heading({importance: 4}).addText('Selected Checkboxes: ', '@selectedCheckboxes')
                    )
                )
                .addToContainer(
                    new tapc.Content().addToContainer(
                        new tapc.Content({repeat: 'input of radios'}).addToContainer(
                            new tapc.Input({name: 'radios', type: tapc.InputType.RADIO, model: '@input', checked: '@selectedRadio'}),
                            new tapc.Text({text: ' '}),
                            new tapc.Text({text: '@input.label'})
                        ),
                        new tapc.Heading({importance: 4}).addText('Selected Checkboxes: ', '{ value: ', '@selectedRadio.value', ', label: ', '@selectedRadio.label', ' }')
                    )
                );
    }

    /**
     * Blade activation (initialization);
     */
    public activate() {
        console.log('[EXT-2] activate method called');
        // fake a timeout for an extension activation
        const timeout: number = 500;
        const promise = new Promise<undefined>((resolve) => {
            this.title = 'Extension 2';
            this.subtitle = 'Form Blade';
            
            setTimeout(resolve, timeout);
        });
        return promise;
    }

    public canActivate() {
        console.log('[EXT-2] canActivate method called');
        // fake a timeout for an extension can activate call and return whether an extension can activate
        const retVal: boolean = true;
        const timeout: number = 0;
        const promise = new Promise<boolean>((resolve) => {
            setTimeout(() => { resolve(retVal); }, timeout);
        });
        return promise;
    }

    public deactivate() {
        console.log('[EXT-2] deactivate method called');
        // fake a timeout for an extension deactivation
        const timeout: number = 500;
        const promise = new Promise<undefined>((resolve) => {
            setTimeout(resolve, timeout);
        });
        return promise;
    }

    public canDeactivate() {
        console.log('[EXT-2] canDeactivate method called');
        // fake a timeout for an extension can deactivate call and return whether an extension can deactivate
        const retVal: boolean = true;
        const timeout: number = 0;
        const promise = new Promise<boolean>((resolve) => {
            setTimeout(() => { resolve(retVal); }, timeout);
        });
        return promise;
    }
    
    public onConventionClick() {
        const origSubtitle = this.subtitle;
        this.subtitle = origSubtitle + ' - Convention Button Clicked!';
        this.conventionDisabled = true;

        const user: any = this._tapFx.Security.getUserInfo();
        console.log('[EXT-2] userInfo: ', user);

        setTimeout(() => {
            this.subtitle = origSubtitle;
            this.conventionDisabled = false;
        }, 3000);
    }

    public onClickMeClick(arg: any, arg2: any) {
        console.log('[EXT-2] onClickMeClick arg 1: ' + arg + ' | arg 2: ' + arg2);
        this.selectedOption = this.selectOptions[this._tapFx.Utilities.getRandomInt(0, this.selectOptions.length - 1)];
        this.selectedCheckboxes = [this.checkboxes[this._tapFx.Utilities.getRandomInt(0, this.checkboxes.length - 1)]];
        this.selectedRadio = this.radios[this._tapFx.Utilities.getRandomInt(0, this.radios.length - 1)];

        this._tapFx.Http.fetchRequest('https://jsonplaceholder.typicode.com/users/7', {}).then(response => {
            console.log('[EXT-2] response: ', response);
        });
    }
}

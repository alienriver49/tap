class LandingBlade extends window.TapFx.ViewModels.BaseBlade {
    title: string;
    subtitle: string;

    buttonConventionDisabled = false;
    showHideCheckbox = true;

    selectOptions = ['Option 1', 'Option 2', 'Option 3'];
    selectedOption = this.selectOptions[0];

    checkboxes = ['Checkbox 1', 'Checkbox 2', 'Checkbox 3'];
    selectedCheckboxes = [this.checkboxes[0]];

    radios = [
        {value: 1, label: 'Radio 1'},
        {value: 2, label: 'Radio 2'},
        {value: 3, label: 'Radio 3'},
    ];
    selectedRadio = this.radios[0];

    constructor() {
        super();

        setTimeout(() => {
            this.radios[1].value = 5;
            this.radios[1].label = 'Radio 5';
            console.log('[EXT-2] radio 2 changed');
        }, 5000);

        /*setInterval(() => {
            let newValue = window.TapFx.Utilities.randomInteger(0, 100);

            let randomInt = window.TapFx.Utilities.randomInteger(0, (this.radios.length - 1));
            console.log(randomInt);
            this.radios[randomInt].value = newValue;
            this.radios[randomInt].label = 'Radio ' + newValue;
        }, 1000);*/
    }

    activate() {
        console.log('[EXT-2] activate method called');
        // fake a timeout for an extension activation
        let timeout: number = 500;
        let promise = new Promise<undefined>((resolve) => {
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
        setTimeout(() => {
            this.subtitle = origSubtitle;
            this.buttonConventionDisabled = false;
        }, 3000)
    }

    onButtonClickMeClick(arg: any, arg2: any) {
        console.log('[EXT-2] onButtonClickMeClick arg 1: ' + arg + ' | arg 2: ' + arg2);
        //this.selectedOption = this.selectOptions[window.TapFx.Utilities.randomInteger(0, 2)];
        //this.selectedCheckboxes = [this.checkboxes[window.TapFx.Utilities.randomInteger(0, 2)]];

        let randomRadio = this.radios[window.TapFx.Utilities.randomInteger(0, 2)];
        this.selectedRadio = randomRadio;
        /*this.selectedRadio.label = randomRadio.label;
        this.selectedRadio.value = randomRadio.value;*/
    }
}

export default LandingBlade
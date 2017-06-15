class LandingBlade extends window.TapFx.ViewModels.Blade {
    title: string;
    subtitle: string;

    buttonConventionDisabled = false;
    showHideCheckbox = true;

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
        alert('Button clicked!\n\nReceived arg:\n' + arg + '\n\nReceived arg2:\n' + arg2);
    }
}

export default LandingBlade
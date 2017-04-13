module Extension1 {
    export class MainBlade extends TapFx.Ux.ViewModels.Blade {
        constructor() {
            super();
            console.log('MAIN BLADE WAS CONSTRUCTED');
        }

        onInitialize(): void {
            this.title = 'EXTENSION 1';
            this.subtitle = 'EXTENSION 1 SUBTITLE';
            console.log('calling on intialize');
        }
    }
}
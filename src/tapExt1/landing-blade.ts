import * as AureliaBinding from 'aurelia-binding'

export default class LandingBlade {
    title: string;
    subtitle: string;

    constructor() {
        console.log('', AureliaBinding);
    }

    titleChanged(newValue: string, oldValue: string): void {
        console.log('Now...the Blade...knows that the title has changed.')
    }

    subtitleChanged(newValue: string, oldValue: string): void {
        console.log('Now...the Blade...knows that the subtitle has changed.')
    }
}
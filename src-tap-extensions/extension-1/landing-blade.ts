export default class LandingBlade {
    title: string;
    subtitle: string;

    titleChanged(newValue: string, oldValue: string): void {
        console.log('Now...the Blade...knows that the title has changed.')
    }

    subtitleChanged(newValue: string, oldValue: string): void {
        console.log('Now...the Blade...knows that the subtitle has changed.')
    }
}
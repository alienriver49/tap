export interface IAddressConfig {
    line1?: string;
    line2?: string;
    town?: string;
    state?: string;
    zip?: string; 
    address?: Address;
}

export class Address {
    public line1: string;
    public line2: string;
    public town: string;
    public state: string;
    public zip: string; 
    public address: Address;

    constructor(config?: IAddressConfig) {
        if (config === void 0) { 
            config = {}; 
        }
        this.line1 = config.line1 || '';
        this.line2 = config.line2 || '';
        this.town = config.town || '';
        this.state = config.state || '';
        this.zip = config.zip || '';
    }

}

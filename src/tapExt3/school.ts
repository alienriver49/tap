import {Address} from './address'

export interface ISchoolConfig {
    name?: string;
    grades?: number[];
    address?: Address;
    hasPool?: boolean;
}

export class School {
    public name: string;
    public grades: number[];
    public address: Address;
    public hasPool: boolean;

    constructor(config?: ISchoolConfig) {
        if (config === void 0) { config = {}; }
        this.name = config.name || '';
        this.grades = config.grades || [];
        this.address = config.address || new Address();
        this.hasPool = config.hasPool || false;
    }

}
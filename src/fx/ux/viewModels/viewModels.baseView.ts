import { IBaseElement } from '../components/baseElement';
import * as tapm from '../../metadata/metadata';
import { Utilities } from '../../utilities/utilities';

export interface IBaseView {
    content: IBaseElement[]; 
    viewName: string;
    isBlade: boolean;

    // Name and Of are used together to simulate nameof functionality
    // similar to C#
    // EX: this.Name(this.Of(() => this.address.line1));
    Name(fnString: string): string;
    Of(fn: any): string;
}

export class BaseView implements IBaseView {
    constructor() {
    }

    @tapm.NoObserve()
    public Of = Utilities.Of;
    
    @tapm.NoObserve()
    public Name = Utilities.Name;

    @tapm.NoObserve()
    public isBlade = false;

    // TODO: how can we make this limited to the developers?
    // Use a getter/setter for this and check the RpcClient.InstanceId?
    @tapm.NoObserve()
    public content: IBaseElement[] = [];

    @tapm.NoObserve()
    public viewName: string = '';

}

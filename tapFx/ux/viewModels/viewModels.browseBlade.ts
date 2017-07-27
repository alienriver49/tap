import {BaseElement} from './../components/BaseElement'
import {IButton} from './../components/Button'
import {BaseBlade} from './viewModels.baseBlade'

export class BrowseBlade extends BaseBlade {
    constructor() {
        super();
    }

    public addActionButtons(...buttons: IButton[]) {
        
    }
}

export default BrowseBlade
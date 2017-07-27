import {IButton} from './../components/Button'
import {BaseBlade} from './viewModels.baseBlade'
import * as tapc from './../tapcModules'

export class BrowseBlade extends BaseBlade {
    constructor() {
        super();
    }

    /**
     * Add the action buttons to a browse blade.
     * @param buttons 
     */
    public addActionButtons(...buttons: IButton[]) {
        this.content.push(
            new tapc.Content().addToContainer(
                ...buttons
            )
        )
    }
}

export default BrowseBlade
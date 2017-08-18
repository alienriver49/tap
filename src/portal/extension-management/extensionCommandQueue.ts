import { inject } from 'aurelia-framework';

import { ITapFx } from '../../fx/core/bootstrap';
import { DeferredPromise } from '../../fx/core/deferredPromise'; // TODO - expose this via tapFx object

/**
 * Class for storing and transferring the results of extension commands (load, unload, etc.).
 */
export class ExtensionCommandResult {
    constructor() { }

    /**
     * Whether the extension command was successful.
     */
    public successful: boolean;
    /**
     * A message to accompany the result.
     */
    public message: string;
}

/**
 * Interface for storing command information.
 */
export interface ICommand {
    extensionId: string;
    commandId: string;
    defer: DeferredPromise<ExtensionCommandResult>;
}

/**
 * Class for queueing extension commands (promises).
 * TODO: implement command timeouts
 */
@inject('TapFx')
export class ExtensionCommandQueue {
    constructor(
        private _tapFx: ITapFx,
    ) {
        this.clear();
    }

    /**
     * A promise queue which ensures that commands are executed in sequential order.
     */
    private _commandPromiseQueue;

    /**
     * Information about the current command in the queue.
     */
    public current: ICommand = {} as ICommand;

    /**
     * Queue an extension command call.
     * @param extensionId 
     * @param commandCall 
     */
    public queueCommand(extensionId: string, commandCall: () => void): void {
        // create a command id to be associated with this
        const commandId = this._tapFx.Utilities.newGuid();
        // new up a deferred promise
        const defer: DeferredPromise<ExtensionCommandResult> = new DeferredPromise<ExtensionCommandResult>();

        // append to the promise queue
        this._commandPromiseQueue = this._commandPromiseQueue.then((result) => {
            // set the current command information to this information
            this.current.extensionId = extensionId;
            this.current.commandId = commandId;
            this.current.defer = defer;
            
            // return a promise which will call the commandCall and then resolve to the defer.promise. this allows the command to be called at the appropriate time in the queue and the promise to be resolved by the extensionManager
            return new Promise((resolve) => {
                commandCall();
                resolve(defer.promise);
            });
        });
    }

    /**
     * "Clear" the queue, currently resets the promise.
     */
    public clear() {
        this._commandPromiseQueue = Promise.resolve<ExtensionCommandResult>({successful: true, message: ''});
    }
}

import DeferredPromise from './../deferredPromise';

/**
 * Class for storing and transferring the results of extension commands (load, unload, etc.).
 */
export class ExtensionCommandResult {
    constructor() { }

    /**
     * Whether the extension command was successful.
     */
    successful: boolean;
    /**
     * A message to accompany the result.
     */
    message: string;
}

interface ICurrentCommand {
    extensionId: string;
    commandId: string;
    defer: DeferredPromise<ExtensionCommandResult>;
}

/**
 * Class for queueing extension commands (promises).
 */
export class ExtensionCommandQueue {
    constructor() {
    }

    private _commandPromiseQueue = Promise.resolve<ExtensionCommandResult>({successful: true, message: ''});

    /**
     * Information about the current command in the queue.
     */
    current: ICurrentCommand = {} as ICurrentCommand;

    /**
     * Queue an extension id command call.
     * @param extensionId 
     * @param commandCall 
     */
    queueCommand(extensionId: string, commandCall: Function): void {
        // create a command id to be associated with this
        let commandId = window.TapFx.Utilities.newGuid();
        // new up a deferred promise
        let defer: DeferredPromise<ExtensionCommandResult> = new DeferredPromise<ExtensionCommandResult>();

        // append to the promise queue
        this._commandPromiseQueue = this._commandPromiseQueue.then((result) => {
            // if successful we will continue to queue, otherwise everything after is cancelled. note: good chance this won't stay this way, but initially this is fine
            if (result.successful) {
                // set the current command information to this information
                this.current.extensionId = extensionId;
                this.current.commandId = commandId;
                this.current.defer = defer;
                
                // return a promise which will call the commandCall and then resolve to the defer.promise. this allows the extensionManager to resolve the current command later.
                return new Promise((resolve) => {
                    commandCall();
                    resolve(defer.promise);
                });
            }
            return result;
        });
    }
}

export default ExtensionCommandQueue;
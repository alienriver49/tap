/**
 * Reusable class for deferred promises.
 */
export class DeferredPromise<T> {
    constructor(
    ) {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    public promise: Promise<T>;
    public resolve: (value?: T | PromiseLike<T> | undefined) => void;
    public reject: (reason?: any) => void;
}

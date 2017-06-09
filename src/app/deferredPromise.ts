/**
 * Reusable class for deferred promises.
 */
class DeferredPromise<T> {
    constructor(
    ) {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    promise: Promise<T>;
    resolve: (value?: T | PromiseLike<T> | undefined) => void;
    reject: (reason?: any) => void;
}

export default DeferredPromise;
import { AttributeMetadata } from '../metadata/attributeMetadata';

export interface IDisabledConfig {
    disabled?: string;
}

export interface IDisabled {
    attributeDisabled: string;
}

// TODO: should move this somewhere re-usable
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * A mixin which can be applied to classes which would like to implement the 'disabled' attribute.
 * @param Base
 */
export function Disableable<TBase extends Constructor>(Base: TBase) { // tslint:disable-line:variable-name
    return class extends Base implements IDisabled {
        constructor(...args: any[]) {
            super(...args);

            this.attributeDisabled = (args.length > 0 && args[0].disabled) || '';

            AttributeMetadata.define('disabled', this, 'attributeDisabled');
        }

        public attributeDisabled: string;
    };
}

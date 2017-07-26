import { resolve, join } from 'path';

/** The root of the tap-fx modules */
export const TAP_FX_ROOT: string = resolve(__dirname, '../../src/tapFx/');

/** The location of the tslint.json file */
export const TSLINT_PATH: string = resolve(__dirname, '../../tslint.json');

/** This is the location of the built npm modules for each tap-fx module */
export const RELEASE_ROOT: string = resolve(__dirname, '../../release/');

/** The root location of the release packages */
export const RELEASE_PACKAGES_ROOT: string = join(RELEASE_ROOT, 'packages');

/** The location of the release path for the tap-fx package */
export const RELEASE_TAP_FX_ROOT: string = join(RELEASE_PACKAGES_ROOT, 'tap-fx');

/** The location of the release bundles for the tap-fx package */
export const RELEASE_TAP_FX_BUNDLE_ROOT: string = join(RELEASE_TAP_FX_ROOT, 'bundles');

/** The location of the release typings for the tap-fx package */
export const RELEASE_TAP_FX_TYPINGS_ROOT: string = join(RELEASE_TAP_FX_ROOT, 'typings');

// Files names for the tap-fx package bundles
export const TAP_FX_ES2015_BUNDLE_NAME: string = 'tap-fx.js';
export const TAP_FX_ES5_BUNDLE_NAME: string = 'tap-fx.es5.js';
export const TAP_FX_UMD_BUNDLE_NAME: string = 'tap-fx.umd.js';

export const TAP_FX_PACKAGE_JSON_PATH: string = join(TAP_FX_ROOT, 'package.json');

import { resolve, join } from 'path';

/** The prefix used for npm packages */
export const MODULE_PACKAGE_PREFIX: string = 'tap-fx-';

/** Root location of the framework source */
export const SRC_ROOT: string = resolve(__dirname, '../../src/');



/** The root of the tap-portal module */
export const PORTAL_ROOT: string = join(SRC_ROOT, 'portal');

/** The location of the tslint.json file */
export const TSLINT_PATH: string = resolve(__dirname, '../../tslint.json');

/** This is the location of the built npm modules for each tap-fx module */
export const RELEASE_ROOT: string = resolve(__dirname, '../../release/');

/** The root location of the release packages */
export const RELEASE_PACKAGES_ROOT: string = join(RELEASE_ROOT, 'packages');

export const TAP_FX_ROOT: string = join(SRC_ROOT, 'fx');
export const RELEASE_TAP_FX_ROOT: string = join(RELEASE_PACKAGES_ROOT, 'tap-fx');
export const RELEASE_TAP_FX_TYPINGS_ROOT: string = join(RELEASE_TAP_FX_ROOT, 'typings');
export const TAP_FX_ES2015_BUNDLE_NAME: string = 'tap-fx.js';
export const TAP_FX_PACKAGE_JSON_PATH: string = join(TAP_FX_ROOT, 'package.json');

export const TAP_WEB_COMPONENTS_ROOT: string = join(SRC_ROOT, 'webComponents');
export const RELEASE_TAP_WEB_COMPONENTS_ROOT: string = join(RELEASE_PACKAGES_ROOT, 'tap-web-components');
export const RELEASE_TAP_WEB_COMPONENTS_TYPINGS_ROOT: string = join(RELEASE_TAP_WEB_COMPONENTS_ROOT, 'typings');
export const TAP_WEB_COMPONENTS_ES2015_BUNDLE_NAME: string = 'tap-web-components.js';
export const TAP_WEB_COMPONENTS_PACKAGE_JSON_PATH: string = join(TAP_WEB_COMPONENTS_ROOT, 'package.json');

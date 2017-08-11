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

// fx
export const TAP_FX_ROOT: string = join(SRC_ROOT, 'fx');
export const RELEASE_TAP_FX_ROOT: string = join(RELEASE_PACKAGES_ROOT, 'tap-fx');
export const RELEASE_TAP_FX_BUILD_ROOT: string = join(RELEASE_TAP_FX_ROOT, 'typings');
export const TAP_FX_ES2015_BUNDLE_NAME: string = 'tap-fx.js';
export const TAP_FX_PACKAGE_JSON_PATH: string = join(TAP_FX_ROOT, 'package.json');

// portal
export const TAP_PORTAL_ROOT: string = join(SRC_ROOT, 'portal');
export const RELEASE_TAP_PORTAL_ROOT: string = join(RELEASE_PACKAGES_ROOT, 'tap-portal');
export const RELEASE_TAP_PORTAL_BUILD_ROOT: string = join(RELEASE_TAP_PORTAL_ROOT, 'typings');
export const TAP_PORTAL_ES2015_BUNDLE_NAME: string = 'tap-portal.js';
export const TAP_PORTAL_PACKAGE_JSON_PATH: string = join(TAP_PORTAL_ROOT, 'package.json');

// webComponents
export const TAP_WEB_COMPONENTS_ROOT: string = join(SRC_ROOT, 'webComponents');
export const RELEASE_TAP_WEB_COMPONENTS_ROOT: string = join(RELEASE_PACKAGES_ROOT, 'tap-web-components');
export const RELEASE_TAP_WEB_COMPONENTS_BUILD_ROOT: string = join(RELEASE_TAP_WEB_COMPONENTS_ROOT, 'typings');
export const TAP_WEB_COMPONENTS_ES2015_BUNDLE_NAME: string = 'tap-web-components.js';
export const TAP_WEB_COMPONENTS_PACKAGE_JSON_PATH: string = join(TAP_WEB_COMPONENTS_ROOT, 'package.json');

export const DEFAULT_COMPILER_OPTIONS = {
  module: 'es2015',
  moduleResolution: 'node',
  target: 'es2015',
  lib: ['dom', 'es2015'],
  sourceMap: true,
  inlineSources: true,
  declaration: true,
  experimentalDecorators: true,
  noImplicitAny: false,
  suppressImplicitAnyIndexErrors: true,
  allowSyntheticDefaultImports: true,
  noImplicitReturns: true,
  preserveConstEnums: true,
  strictNullChecks: true,
  pretty: true
};

// Extended TAP modules
export const TAP_MODULES = [
  'webComponents',
  'portal'
];

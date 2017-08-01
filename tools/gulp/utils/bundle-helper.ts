import { join } from 'path';
import * as rollup from 'rollup';

const rollupTypeScript = require('rollup-plugin-typescript');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const rollupNodeResolve = require('rollup-plugin-node-resolve');

import { TAP_FX_ROOT } from '../constants';

export interface IRollupBundleConfig {
    entry: string;
    moduleName: string;
    format: 'es' | 'umd';
    dest: string;
    version: string;
    tsconfigPath: string;
}

const ROLLUP_GLOBALS = {
    'aurelia-bootstrapper': 'aurelia-bootstrapper',
    'aurelia-dependency-injection': 'aurelia-dependency-injection',
    'aurelia-binding': 'aurelia-binding',
    'aurelia-framework': 'aurelia-framework',
    'aurelia-fetch-client': 'aurelia-fetch-client',
    'aurelia-auth': 'aurelia-auth',
    'tap-fx-binding': 'tap-fx-binding',
    'tap-fx-core': 'tap-fx-core',
    'tap-fx-rpc': 'tap-fx-rpc',
    'tap-fx-security': 'tap-fx-security',
    'tap-fx-utilities': 'tap-fx-utilities',
    'tap-fx-ux': 'tap-fx-ux'
};

/**
 * Creates a rollup bundle from the provided configuration.
 * @param config The rollup bundle configuration options.
 */
export function createModuleBundle(config: IRollupBundleConfig): Promise<void> {
    let bundleOptions = {
        context: 'this',
        external: Object.keys(ROLLUP_GLOBALS),
        entry: config.entry,
        plugins: [
            rollupNodeResolve(),
            rollupTypeScript({
                typescript: require('typescript'),
                tsconfig: require(config.tsconfigPath)
            })
        ]
    };

    const banner = `/**
    * @license Titanium Application Portal v${config.version}
    * Copyright (c) 2017 Tyler Technologies, Inc.
    * License: MIT
    */`;

    let writeOptions = {
        moduleId: '',
        moduleName: config.moduleName,
        banner: banner,
        format: config.format,
        dest: config.dest,
        globals: ROLLUP_GLOBALS,
        sourceMap: true
    };

    return rollup.rollup(bundleOptions).then(bundle => bundle.write(writeOptions));
}

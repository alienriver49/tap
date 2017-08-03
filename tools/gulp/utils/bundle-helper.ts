import { join } from 'path';
import * as rollup from 'rollup';

const rollupNodeResolve = require('rollup-plugin-node-resolve');
const rollupPostCss = require('rollup-plugin-postcss');
const rollupPluginCommonJs = require('rollup-plugin-commonjs');

import { getPackageDirectories } from './directory-utils';
import { kebabCase } from './string-utils';
import { TAP_FX_ROOT, MODULE_PACKAGE_PREFIX, DEFAULT_COMPILER_OPTIONS } from '../constants';

export interface IRollupBundleConfig {
    entry: string;
    moduleName: string;
    format: 'es' | 'umd';
    dest: string;
    version: string;
}

const ROLLUP_GLOBALS: any = {
    'aurelia-bootstrapper': 'aurelia-bootstrapper',
    'aurelia-dependency-injection': 'aurelia-dependency-injection',
    'aurelia-binding': 'aurelia-binding',
    'aurelia-framework': 'aurelia-framework',
    'aurelia-fetch-client': 'aurelia-fetch-client',
    'aurelia-auth': 'aurelia-auth',
    'numeral': 'numeral',
    'moment': 'moment',
    'reflect-metadata': 'reflect-metadata'
};

// Add the TAP packages to the rollup globals
const moduleNames = getPackageDirectories(TAP_FX_ROOT);
moduleNames.forEach(name => {
    const fullPackageName = MODULE_PACKAGE_PREFIX + kebabCase(name);
    ROLLUP_GLOBALS[fullPackageName] = fullPackageName;
});

/**
 * Creates a rollup bundle from the provided configuration.
 * @param config The rollup bundle configuration options.
 */
export function createModuleBundle(config: IRollupBundleConfig): Promise<void> {
    const bundleOptions = {
        context: 'this',
        external: Object.keys(ROLLUP_GLOBALS),
        entry: config.entry,
        plugins: [
            rollupNodeResolve(),
            rollupPostCss({
                extensions: ['.css']
            }),
            rollupPluginCommonJs({
                namedExports: {
                    'node_modules\aurelia-event-aggregator\dist\commonjs\aurelia-event-aggregator.js': ['EventAggregator']
                }
            })
        ]
    };

    const banner = `/**
    * @license Titanium Application Portal v${config.version}
    * Copyright (c) 2017 Tyler Technologies, Inc.
    * License: MIT
    */`;

    const writeOptions = {
        moduleId: '',
        moduleName: config.moduleName,
        banner,
        format: config.format,
        dest: config.dest,
        globals: ROLLUP_GLOBALS,
        sourceMap: true
    };

    return rollup.rollup(bundleOptions).then(bundle => bundle.write(writeOptions));
}

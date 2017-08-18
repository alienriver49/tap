import { join } from 'path';
import * as rollup from 'rollup';

const rollupNodeResolve = require('rollup-plugin-node-resolve');
const rollupBabel = require('rollup-plugin-babel');

import { getPackageDirectories } from './directory-utils';
import { dashCase } from './string-utils';
import { TAP_FX_ROOT, MODULE_PACKAGE_PREFIX, DEFAULT_COMPILER_OPTIONS } from '../constants';

export interface IRollupBundleConfig {
    entry: string;
    moduleName: string;
    format: 'es' | 'cjs';
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
    'aurelia-event-aggregator': 'aurelia-event-aggregator',
    'aurelia-templating': 'aurelia-templating',
    'aurelia-templating-binding': 'aurelia-templating-binding',
    'aurelia-html-import-template-loader': 'aurelia-html-import-template-loader',
    'aurelia-loader': 'aurelia-loader',
    'aurelia-loader-default': 'aurelia-loader-default',
    'aurelia-history': 'aurelia-history',
    'aurelia-pal': 'aurelia-pal',
    'numeral': 'numeral',
    'moment': 'moment',
    'reflect-metadata': 'reflect-metadata',
    'tap-fx': 'tap-fx'
};

// Add the TAP packages to the rollup globals
const moduleNames = getPackageDirectories(TAP_FX_ROOT);
moduleNames.forEach(name => {
    const fullPackageName = MODULE_PACKAGE_PREFIX + dashCase(name);
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
            rollupNodeResolve()
        ]
    };

    if (config.format === 'cjs') {
        bundleOptions.plugins.push(rollupBabel({
            exclude: 'node_modules/**',
            presets: [
                ['es2015', { modules: false }]
            ],
            plugins: ['external-helpers']
        }));
    }

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

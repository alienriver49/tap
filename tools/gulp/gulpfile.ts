import { join } from 'path';
import { task, TaskFunction } from 'gulp';
import * as runSequence from 'run-sequence';

import './tasks/clean';
import './tasks/package';

import { lintTs } from './utils/lint-utils';
import { SRC_ROOT } from './constants';

/** Runs the build tasks for all packages. */
task('build:all', (done: TaskFunction) => {
    return runSequence(
        'clean:release',
        'build:tap-fx',
        'build:tap-fx-modules',
        'build:tap-portal',
        'build:tap-web-components',
        done
    );
});

/** Lints the TypeScript code for all packages. */
task('lint:ts:all', () => {
    return lintTs([join(SRC_ROOT, '**!(exts)/*!(.spec).ts')]);
});

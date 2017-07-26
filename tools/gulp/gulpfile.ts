import { task } from 'gulp';

const runSequence = require('run-sequence');

import './tasks/clean';
import './tasks/lint';
import './tasks/package';

task('build', (done: Function) => {
    return runSequence(
        //'lint:ts',
        'build:packages',
        done
    );
});

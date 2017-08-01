import { join } from 'path';
import { task, src } from 'gulp';
import tslint from 'gulp-tslint';

import { TAP_FX_ROOT, TSLINT_PATH, PORTAL_ROOT } from '../constants';

/** Lints all TypeScript files in the tap-fx modules */
task('lint:ts', () => {
    return src([
            join(TAP_FX_ROOT, '**/*.ts'),
            join(PORTAL_ROOT, '**/*.ts')
        ])
        .pipe(tslint({
            configuration: TSLINT_PATH,
            formatter: 'verbose'
        }))
        .pipe(tslint.report({
            reportLimit: 10
        }));
});

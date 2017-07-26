import { src, dest } from 'gulp';
import { join } from 'path';

import { TAP_FX_ROOT } from '../constants';

/** 
 * Copies a file to the specified output directory.
 * @param {string} filePath The path to the file to be copied.
 * @param {string} outputDir The path to the destination directory.
 */
export function copyFile(filePath: string, outputDir: string): NodeJS.ReadWriteStream {
    return src([filePath]).pipe(dest(outputDir));
}
import { src, dest } from 'gulp';
import { join } from 'path';

import { getPackageDirectories } from '../utils/directory-utils';
import { TAP_FX_ROOT, SRC_ROOT } from '../constants';

/** 
 * Copies a file to the specified output directory.
 * @param {string} filePath The path to the file to be copied.
 * @param {string} outputDir The path to the destination directory.
 */
export function copyFiles(filePaths: string[], outputDir: string): NodeJS.ReadWriteStream {
    return src(filePaths).pipe(dest(outputDir));
}

/**
 * Finds all relative imports to our submodules within a file and replaces the imports with package names.
 * @param {string} fileContent The contents of a file.
 */
export function fixupRelativeImports(fileContent: string): string {
    let moduleNames = getPackageDirectories(SRC_ROOT).join('|');
    let relativeModuleImportRegEx = new RegExp(`^(import(?:["'\s]*(?:[\w*{}\n, ]*)from)?\s["'])(?:\.{1,2}\/)[./]*?(${moduleNames})\/?(?:.*)(["'];?)$`, 'gm');
    let modulePrefix = 'tap-fx-';

    return fileContent.replace(relativeModuleImportRegEx, `$1${modulePrefix}$2$3`);
}

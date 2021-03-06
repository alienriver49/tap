import { src, dest } from 'gulp';
import { join } from 'path';
import { SrcOptions } from 'vinyl-fs';

import { getPackageDirectories } from '../utils/directory-utils';
import { TAP_FX_ROOT, SRC_ROOT } from '../constants';

/** 
 * Copies a file to the specified output directory.
 * @param {string} filePath The path to the file to be copied.
 * @param {string} outputDir The path to the destination directory.
 */
export function copyFiles(filePaths: string[], outputDir: string, srcOptions?: SrcOptions): NodeJS.ReadWriteStream {
    return src(filePaths, srcOptions).pipe(dest(outputDir));
}

/**
 * Finds all relative imports to our submodules within a file and replaces the imports with package names.
 * @param {string} fileContent The contents of a file.
 */
export function fixupRelativeImports(fileContent: string): string {
    const moduleNames = getPackageDirectories(SRC_ROOT).join('|');
    const relativeModuleImportRegEx = new RegExp(`^(import(?:["'\s]*(?:[\w*{}\n, ]*)from)?\s["'])(?:\.{1,2}\/)[./]*?(?:fx\/)?(${moduleNames})\/?(?:.*)(["'];?)$`, 'gm');
    const modulePrefix = 'tap-fx-';

    return fileContent.replace(relativeModuleImportRegEx, `$1${modulePrefix}$2$3`);
}

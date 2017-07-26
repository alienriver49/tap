const path = require('path');

const tsconfigPath = path.join(__dirname, './tools/gulp/tsconfig-gulp.json');
const tsconfig = require(tsconfigPath);

require('ts-node').register({ project: tsconfigPath });
require('./tools/gulp/gulpfile');

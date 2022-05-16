import { Options } from '@swc/core';

export const swc: (opts: Options) => NodeJS.ReadWriteStream = require('gulp-swc');

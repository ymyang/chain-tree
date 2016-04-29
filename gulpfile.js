'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');

gulp.task('clean', () => {
    del(['./build']);
});

gulp.task('js', () => {
    gulp.src([
        '*.js',
        '*/*.js',
        '!gulpfile.js',
        '!doc/**',
        '!node_modules/**',
        '!test/**'
    ])
        .pipe(babel({
            presets: ['es2015']
        }))
        //.pipe(uglify())
        .pipe(gulp.dest('./build'));
});

gulp.task('json', () => {
    return gulp.src('./*.json')
        .pipe(gulp.dest('./build'));
});

gulp.task('build', ['json', 'js']);

gulp.task('default', ['build']);
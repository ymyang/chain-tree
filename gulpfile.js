'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');
const SequelizeAuto = require('sequelize-gen');
const webpack = require('webpack');

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
            presets: ['es2015','stage-0']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

gulp.task('json', () => {
    return gulp.src('./*.json')
        .pipe(gulp.dest('./build'));
});

gulp.task('jsmodels', () => {
    gulp.src([
        'models/*.js',
        '!models/index.js'
    ])
        .pipe(babel({
            presets: ['es2015','stage-0']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

gulp.task('webpack', ['json','jsmodels'], () => {
    let config = require('./webpack.config.js');
    webpack(config, (err, stats) => {
        if (err) {
            console.error('webpack', err);
            return;
        }
        console.log('webpack ok');
    });
});

gulp.task('models', () => {
    let auto = new SequelizeAuto('chain_tree', 'root', 'admin');
    auto.run((err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(auto.tables);
    });
});

gulp.task('build', ['json', 'js']);

gulp.task('default', ['webpack']);
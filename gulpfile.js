const gulp = require('gulp');
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const autoprefixer = require('gulp-autoprefixer');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gcmq = require('gulp-group-css-media-queries');
const plumber = require("gulp-plumber");
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const webp = require('gulp-webp');
const svgstore = require("gulp-svgstore");
const cheerio = require('gulp-cheerio');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const gulpif = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync').create();

const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;
const isSync = (process.argv.indexOf('--sync') !== -1);

let config = {
    src: './src',
    build: './build',
    html: {
        src: '/*.html',
        dest: '/'
    },
    fonts: {
        src: '/fonts/*',
        dest: '/fonts/'
    },
    js: {
        src: '/js/*.js',
        dest: '/js/'
    },
    img: {
        src: '/img/**/*',
        dest: '/img/'
    },
    css: {
        src: '/css/*',
        dest: '/css/'
    },
    less: {
        watch: '/less/**/*.less',
        src: '/less/styles.less',
        dest: '/css/'
    }
};

function html() {
    return gulp.src(config.src + config.html.src)
        .pipe(posthtml([
            include()
        ]))
        .pipe(gulp.dest(config.build + config.html.dest))
        .pipe(gulpif(isSync, browserSync.stream()));
}

function styles() {
    return gulp.src(config.src + config.less.src)
       .pipe(less())
       .pipe(gulpif(isDev, sourcemaps.init()))
       .pipe(gcmq())
       .pipe(autoprefixer({
            overrideBrowserslist: ['defaults'],
            cascade: false
       }))
       .pipe(gulpif(isDev, gulp.dest(config.build + config.less.dest)))
       .pipe(cleanCSS({
            level: 2
        }))
       .pipe(rename("style.min.css"))
       .pipe(gulpif(isDev, sourcemaps.write('.')))
       .pipe(gulp.dest(config.build + config.less.dest))
       .pipe(gulpif(isSync, browserSync.stream()));
}

/*function grid(done) {
	delete require.cache[require.resolve('./smartgrid.js')];
	let settings = require('./smartgrid.js');
	smartgrid('./src/less', settings);
	done();
}*/

function img() {
    return gulp.src(config.src + config.img.src)
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true}),
            imagemin.gifsicle({interlaced: true}),
            imagemin.svgo(),
            imageminMozjpeg({
                quality: 70,
                progressive: true
            }),
            imageminPngquant()
            ]))
        .pipe(gulp.dest(config.build + config.img.dest))
        .pipe(webp({
            quality: 70,
            preset: 'photo',
            lossless: true
        }))
        .pipe(gulp.dest(config.build + config.img.dest));
}

function js(done) {
    return gulp.src(config.src + config.js.src)
         .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(concat('all.js'))
        // .pipe(uglify())
        .pipe(gulpif(isDev, sourcemaps.write('.')))
        .pipe(gulp.dest(config.build + config.js.dest))
        .pipe(gulpif(isSync, browserSync.stream()));
        done();
}

function fonts() {
    return gulp.src(config.src + config.fonts.src)
        .pipe(gulp.dest(config.build + config.fonts.dest));
}

function sprite() {
    return gulp.src(config.src + config.img.src  + 'icon-*.svg')
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest(config.build + config.img.dest));
}

function clean() {
    return del(['build/*']);
}

function watch() {
    if (isSync) {
        browserSync.init({
            server: {
                baseDir: config.build
            }
        });
    }

    gulp.watch(config.src + config.html.src, html);
    gulp.watch(config.src + config.less.watch, styles);
    gulp.watch(config.src + config.img.src, img);
    gulp.watch(config.src + config.js.src, js);
    // gulp.watch('./smartgrid.js', grid);
}

const build = gulp.series(clean, 
    gulp.parallel(html, styles, img, js, fonts, sprite));
const all = gulp.series(build, watch);

// gulp.task('grid', grid);
gulp.task('build', build);
gulp.task('default', all);
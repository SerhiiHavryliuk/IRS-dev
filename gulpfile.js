var livereload = require('gulp-livereload'),
    data = require('gulp-data'),
    gulp = require('gulp'),
    clean = require('gulp-clean'),
    path = require('path'),
    jade = require('jade'),
    gulpJade = require('gulp-jade'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    ftp = require('vinyl-ftp'),
    imagemin = require('gulp-imagemin'),
    cssbase64 = require('gulp-css-base64');

// FTP Configuration
// ! You need change it for your project
var user = 'demo3';
var pass = 'SjaWmHPo';
var host = 'demo3.frondevo.com';
var port = 21;
var localFilesGlob = ['build/**/*'];
var remoteFolder = 'irs/'; // папка проекта на фтп

// helper function to build an FTP connection based on our configuration
function getFtpConnection() {
    return ftp.create({
        host: host,
        port: port,
        user: user,
        password: pass,
        parallel: 5
    });
}

// Tasks
// ----------------------------------------------

gulp.task('default', ['clean', 'jade', 'sass', 'js-main', 'js-other', 'js-lib-main', 'js-lib-other',
    'copy-fonts', 'copy-img', 'copy-pic', 'copy-php', 'copy-robots', 'imagemin', 'cssbase64'],
    function() {
    // place code for your default task here
});

// Livereload run for automaticaly browser window update
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('dev/views/**/*.jade').on('change', function (event) {
        livereload.changed(event.path)
    });

    gulp.watch('dev/static/css/*.css').on('change', function (event) {
        livereload.changed(event.path)
    });
});

// -----------------------------------
// clean build dir
gulp.task('clean', function () {
    return gulp.src('build/*', {read: false})
        .pipe(clean());

});

// -----------------------------------
// compile jade tamplates
// start after clean
gulp.task('jade', ['clean'], function () {
    "use strict";

    return gulp.src(['dev/views/*.jade'])
        .pipe(data(function (file) {
            var pages = require('./pages.json'),
                pageData = pages[path.basename(file.path).replace('.jade', '')] || {};

            pageData.build = true;

            return pageData;
        }))
        .pipe(gulpJade({
            jade: jade,
            pretty: true
        }))
        .pipe(gulp.dest('build/'));

});


// -----------------------------------
// compile sass templates
// start after clean
gulp.task('sass', ['clean'], function () {
    "use strict";
    return gulp.src('dev/static/sass/**/*.scss')
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(postcss([autoprefixer({browsers: ['last 5 version']})]))
        .pipe(sass({
            includePaths: ['node_modules/font-awesome/scss/**/*.*']
        }))
        //.pipe(sourcemaps.write('./')) // todo хз почему это не срабатывает. писточник утверждал что это надо. надо разобраться чото за команда ипочему перестала работать
        .pipe(gulp.dest('build/css'));

});



// -----------------------------------
// склейка main.js
// в склейку попадают только файлы с префиксом _
// start after clean
gulp.task('js-main', ['clean'], function () {
    return gulp.src(['dev/static/js/_*.js'])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('build/js/'))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));
});


// -----------------------------------
// перенос js, которые не попали в main.js
// start after clean
gulp.task('js-other', ['clean'], function () {

    return gulp.src(['dev/static/js/*.js', '!dev/static/js/_*.js'])
         .pipe(gulp.dest('build/js/'));


});


// -----------------------------------
// склейка main.lib.js (папка lib)
// в склейку попадают только файлы с префиксом _
// start after clean
gulp.task('js-lib-main', ['clean'], function () {
    return gulp.src(['dev/static/js/lib/_*.js'])
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('build/js/lib/'))
        .pipe(rename('lib.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/js/lib/'));

    // gulp.src(['dev/static/js/lib/*.js', '!dev/static/js/lib/_*.js'])
    //     .pipe(gulp.dest('build/js/lib/'));

});


// -----------------------------------
// склейка main.lib.js (папка lib)
// в склейку попадают только файлы с префиксом _
// start after clean
gulp.task('js-lib-other', ['clean'], function () {

    return gulp.src(['dev/static/js/lib/*.js', '!dev/static/js/lib/_*.js'])
         .pipe(gulp.dest('build/js/lib/'));

});


// -----------------------------------
// копирование шрифтов
// start after clean
gulp.task('copy-fonts', ['clean'], function () {

    return gulp.src(['dev/static/fonts/**/*.*'])
        .pipe(gulp.dest('build/fonts'));

});


// -----------------------------------
// копирование картинок оформления
// start after clean
gulp.task('copy-img', ['clean'], function () {

    return gulp.src(['dev/static/img/**/*.*'])
        .pipe(gulp.dest('build/img'));

});


// -----------------------------------
// копирование картинок контента
// start after clean
gulp.task('copy-pic', ['clean'], function () {

    return gulp.src(['dev/static/pic/**/*.*'])
        .pipe(gulp.dest('build/pic'));
    //
    // gulp.src(['dev/static/php/**/*.*'])
    //     .pipe(gulp.dest('build/php'));

});


// -----------------------------------
// копирование папки php
// start after clean
gulp.task('copy-php', ['clean'], function () {

    return gulp.src(['dev/static/php/**/*.*'])
        .pipe(gulp.dest('build/php'));

});


// -----------------------------------
// копирование robots.txt
// start after clean
gulp.task('copy-robots', ['clean'], function () {

    return gulp.src(['dev/robots.txt'])
        .pipe(gulp.dest('build/'));

});


// FTP auto deploy
gulp.task('ftp', function() {

    var conn = getFtpConnection();

    return gulp.src(localFilesGlob, { base: '', buffer: false })
        .pipe( conn.dest( remoteFolder ) )
        ;
});

// optimize image
// https://www.npmjs.com/package/gulp-imagemin
// http://diezjietal.be/blog/2015/02/18/image-optimizers.html
gulp.task('imagemin', ['copy-pic', 'copy-img'], function () {

    gulp.src('build/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/img/'));

});


//transform all resources found in a CSS into base64-encoded data URI strings
// https://www.npmjs.com/package/gulp-css-base64/
gulp.task('cssbase64', ['imagemin'], function () {

    return gulp.src('build/css/main.css')
        .pipe(cssbase64({
            //baseDir: "build/css/main.css",
            //maxWeightResource: 1,
            extensionsAllowed: ['.gif','.png']
        }))
        .pipe(gulp.dest('build/css/'));
});


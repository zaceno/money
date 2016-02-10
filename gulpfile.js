const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const Transform = require('stream').Transform;
const browserify = require('browserify');
const babelify = require('babelify');
const envify = require('envify');
const livereload = require('gulp-livereload');

var ENV_DEFAULTS = {
    HOST: '127.0.0.1',
    PORT: 8080,
    liveReload: false,
};

//take propertoes from source, and put into a target,
//using all values from a default, but overriding with
//values if existing, return
function copyProps(target, defaults, overrides) {
    overrides = overrides || {};
    Object.keys(defaults).forEach(function (key) {
        if (!defaults.hasOwnProperty(key)) return;
        target[key] = (overrides.hasOwnProperty(key) ? overrides : defaults)[key];
    })
    return target;
};

/*
    Transform gulp-pipes. Takes a vinyl-file-stream
    and processes it for client side use.
*/
function browserifier() {
    return new Transform({
        objectMode: true,
        flush: (done) => { done(); },
        transform: function (file, enc, next) {
            browserify(file.path)
            .transform(babelify, {presets: 'es2015'})
            .transform(envify)
            .bundle((err, res) => {
                if (err) {
                    gutil.log('ERROR', err);
                    next();
                    return;
                }
                file.contents = res;
                this.push(file);
                next();
            });
        },
    });
};

gulp.task('build:js', () => {
    return gulp.src('./client/script.js').pipe(browserifier()).pipe(gulp.dest('./server/static/')).pipe(livereload());
});

gulp.task('build:html', () => {
    return gulp.src('./client/index.html').pipe(gulp.dest('./server/static/')).pipe(livereload());
});

gulp.task('build', ['build:js', 'build:html']);

gulp.task('config', (done) => {
    fs.readFile('./config.json', 'utf-8', (err, str) => {
        copyProps(process.env, ENV_DEFAULTS, !!err ? null : JSON.parse(str))
        done();
    });
});

gulp.task('serve', ['config', 'build'], (done) => {
    require('./server/index.js')((err, server, app) => {
        var addr = server.address();
        gutil.log('Server listening at %s:%s', addr.address, addr.port);
        done();
    });
});

gulp.task('watch', ['serve'], (done) => {
    gulp.watch('./client/**/*.*', ['build']);
    livereload.listen();
    done();
});


gulp.task('default', ['watch']);

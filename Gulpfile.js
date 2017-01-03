var gulp = require('gulp');
var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var browserSync = require('browser-sync');
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer');

var config = {
  // Production mode is disabled when running default task (dev mode)
  PRODUCTION: true,
  // Development server port
  PORT: 8080,
  // Relative paths to sources and output directories
  SRC_DIR: 'src/',
  BUILD_DIR: 'dist/',

  src: function(path) {
    return this.SRC_DIR + path;
  },
  dest: function(path) {
    return this.BUILD_DIR + path;
  }
};

gulp.task('scripts', function() {
  var bundler = browserify({
    entries: config.src('scripts/index.js'),
    debug: true,
    transform: [babelify]
  });

  return bundler
    .transform(babelify, {presets: ['es2015'], sourceMaps: false})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest(config.dest('assets/js')))
    .pipe(uglify())
    .pipe(gulp.dest(config.dest('assets/js')))
    .pipe(browserSync.reload({ stream: true }));
});


gulp.task('styles', function() {
  return gulp.src(config.src('styles/main.scss'), { base: '.' })
    // .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer("last 1 version"))
    .pipe(sourcemaps.write('.'))
    .pipe(
      gulpif(config.PRODUCTION, minifyCSS())
    )
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest(config.dest('assets/css')))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('html', function() {
  return gulp.src(config.src('index.html'))
    .pipe(replace('bundle.css', 'bundle.css?' + (new Date()).getTime()))
    .pipe(replace('bundle.js', 'bundle.js?' + (new Date()).getTime()))
    .pipe(gulp.dest(config.BUILD_DIR))
    .pipe(browserSync.reload({ stream: true }));
});

/*
 * Helper task to disable production mode before running build task
 */
gulp.task('dev', function() {
  config.PRODUCTION = false;
});

/*
 * Start webserver and activate watchers
 */
gulp.task('server', ['build'], function() {
  browserSync({
    port: config.PORT,
    server: {
      baseDir: config.BUILD_DIR
    }
  });

  gulp.watch(config.src('scripts/**/*.js'), ['scripts']);
  gulp.watch(config.src('styles/**/*.scss'), ['styles']);
  gulp.watch(config.src('index.html'), ['html']);
})

/*
 * Build task - production mode
 */
gulp.task('build', ['scripts', 'styles', 'html']);

/*
 * Default task - development mode
 */

gulp.task('default', ['dev', 'server']);

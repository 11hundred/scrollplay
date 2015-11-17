var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    scsslint      = require('gulp-scss-lint'),
    autoprefixer  = require('gulp-autoprefixer'),
    jshint        = require('gulp-jshint'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglify'),
    filter        = require('gulp-filter'),
    imagemin      = require('gulp-imagemin'),
    pngquant      = require('imagemin-pngquant'),
    rename        = require('gulp-rename'),
    browserSync   = require('browser-sync'),
    sourcemaps    = require('gulp-sourcemaps');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: './'
    },
    notify: false,
    open: false
  });
});

gulp.task('sass', function() {
  gulp.src('src/style/**/*.scss')
    .pipe(scsslint());
  return gulp.src('src/style/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer({
      browsers: ['last 10 versions', 'ie 9', 'ie 8'],
      errLogToConsole: true,
      sync: true
    }))
    .on('error', function(error) { console.log(error.message); })
    .pipe(gulp.dest('dist/style'))
    .pipe(filter('**/*.css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('js', function() {
  return gulp.src(['src/scripts/vendor/**/*.js', 'src/scripts/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('bs-reload', function() {
  browserSync.reload();
});

gulp.task('default', ['sass', 'js', 'images', 'browser-sync'], function() {
  gulp.watch('src/style/**/*.scss', ['sass']);
  gulp.watch('src/scripts/*.js', ['js']);
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch(['*.html', 'src/templates/**/*.svg', 'dist/scripts/*.js'], ['bs-reload']);
});

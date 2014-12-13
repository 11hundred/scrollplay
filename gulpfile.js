var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    scsslint      = require('gulp-scss-lint'),
    autoprefixer  = require('gulp-autoprefixer'),
    jshint        = require('gulp-jshint'),
    filter        = require('gulp-filter'),
    browserSync   = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: './'
    }
  });
});

gulp.task('sass', function () {
  return gulp.src('style/style.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer({
      browsers: ['last 10 versions', 'ie 8'],
      errLogToConsole: true,
      sync: true
    }))
    .on('error', function (err) { console.log(err.message); })
    .pipe(gulp.dest('style'))
    .pipe(filter('**/*.css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('scss-lint', function() {
  gulp.src('style/*/**.scss')
    .pipe(scsslint());
});

gulp.task('lint', function() {
  return gulp.src('scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('default', ['sass', 'scss-lint', 'lint', 'browser-sync'], function () {
  gulp.watch('style/*/**.scss', ['sass', 'scss-lint']);
  gulp.watch('scripts/*.js', ['lint']);
  gulp.watch('*.html', ['bs-reload']);
});

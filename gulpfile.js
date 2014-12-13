var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    scsslint      = require('gulp-scss-lint'),
    autoprefixer  = require('gulp-autoprefixer'),
    jshint        = require('gulp-jshint'),
    uglify        = require('gulp-uglify'),
    filter        = require('gulp-filter'),
    browserSync   = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: './'
    }
  });
});

gulp.task('scss-lint', function() {
  return gulp.src('src/style/*/**.scss')
    .pipe(scsslint());
});

gulp.task('sass', function() {
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

gulp.task('lint', function() {
  return gulp.src('src/scripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
  return gulp.src('src/scripts/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('bs-reload', function() {
  browserSync.reload();
});

gulp.task('default', ['scss-lint', 'sass', 'uglify', 'lint', 'browser-sync'], function() {
  gulp.watch('src/style/**/*.scss', ['scss-lint', 'sass']);
  gulp.watch('src/scripts/*.js', ['lint', 'uglify']);
  gulp.watch('*.html', ['bs-reload']);
});

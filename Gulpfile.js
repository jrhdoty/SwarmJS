var gulp   = require('gulp');
    $      = require('gulp-load-plugins')();

var paths = {
  src: ['node_modules/generic-quadtree/Quadtree/quadtree.js', 'src/vector.js', 'src/swarm.js'],
  dist: 'swarm.js',
  distmin: 'swarm.min.js'
};

gulp.task('lint', function(){
  return gulp.src(paths.src)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.notify({message: 'Linting Done'}));
});

gulp.task('concat', function(){
  return gulp.src(paths.src)
    .pipe($.concat(paths.dist))
    .pipe(gulp.dest(''));
});

gulp.task('minify', function(){
  return gulp.src(paths.src)
    .pipe($.concat(paths.distmin))
    .pipe(gulp.dest(''));
});

gulp.task('uglify', ['minify'], function(){
  return gulp.src(paths.distmin)
    .pipe($.uglify())
    .pipe(gulp.dest(''))
    .pipe($.notify({message: 'Build Done'}));
});

gulp.task('watch', function(){
  gulp.watch(paths.src, ['lint']);
});

//run tests once
gulp.task('test', function(){});


gulp.task('build', ['lint', 'concat', 'uglify']);
gulp.task('default', ['build', 'watch']);
var gulp = require('gulp'),
  fs = require('fs'),
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  uglify = require('gulp-uglify'),
  streamify = require('gulp-streamify'),
  babelify = require("babelify"),
  gsap = require("gsap"),
  glslify = require("glslify"),
  zip = require('gulp-zip');

function compileJS(file){
  browserify('src/'+file+'.js',{debug:true})
    .transform(babelify)
    .transform('glslify')
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(source(file+'.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('build/js'));
}

gulp.task('default', ['js', 'zip'], function(){});

gulp.task('js', function(){
  compileJS('index');
});

gulp.task('zip', function(){
  return gulp.src('build/**/*')
    .pipe(zip('build.zip'))
    .pipe(gulp.dest('.'));
});

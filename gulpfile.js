var gulp=require('gulp');
var minifycss = require('gulp-minify-css');
var less = require('gulp-less');
var uglify=require('gulp-uglify');
var rename=require('gulp-rename');

gulp.task('testLess',function(){
	gulp.src('style/less/*.less')
		.pipe(less())
		.pipe(minifycss())
		.pipe(gulp.dest('style/css'));
});
gulp.task('ugJs',function(){
	gulp.src('scripts/testjs/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('scripts/ugjs'))
});
gulp.task('testWatch',function(){
	gulp.watch('style/less/*.less',function(){
		gulp.run('testLess');
	});
});
gulp.task('default',['testWatch','ugJs']);
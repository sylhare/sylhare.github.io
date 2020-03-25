/*
 * Here are all of the gulp tasks you can use to help manage your blog
 * Use `npm install` to install all the dependencies located in package.json 
 * Then `gulp default` to minimize css and images.
 */
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');

gulp.task("img", function imging() {
  return gulp.src('img/**/*.{png,svg,jpg,webp,jpeg,gif}')
    .pipe(imagemin())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest('img/'))
});

gulp.task("default", gulp.series(gulp.parallel('img')));

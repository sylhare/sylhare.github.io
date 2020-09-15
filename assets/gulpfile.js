/*
 * Here are all of the gulp tasks you can use to help manage your blog
 * Use `npm install` to install all the dependencies located in package.json 
 * Then `gulp default` to minimize css and images.
 */
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const responsive = require('gulp-responsive'); // Supported formats: heic, heif, jpeg, jpg, png, raw, tiff, webp

gulp.task("img", function imging() {
  return gulp.src('img/**/*.{png,svg,jpg,webp,jpeg,gif}')
    .pipe(imagemin())
    .on('error', (err) => {
      console.log(err.toString());
    })
    .pipe(gulp.dest('img/'))
});

// Alternative using "sharp" in case "imagemin" does not work
gulp.task('sharp_img', function () {
  let settings = {
    quality: 60,
    progressive: true,
    compressionLevel: 9,
  };

  return gulp.src('img/**/*.{png,jpg,webp,jpeg}')
    .pipe(responsive({
      '**/*.*': settings,
      '*.*': settings,
    }))
    .pipe(gulp.dest('img'))
});

gulp.task('thumbnails', function () {
  let settings = {
    width: '50%',
    //format: 'jpeg', // convert to jpeg format
  };

  return gulp.src('img/**/*.{png,jpg,webp,jpeg}')
    .pipe(responsive({
      '**/*.*': settings,
      '*.*': settings,
    }))
    .pipe(gulp.dest('thumbnails'))
});


gulp.task("default", gulp.series(gulp.parallel('img')));

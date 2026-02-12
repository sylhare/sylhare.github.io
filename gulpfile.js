import gulp from 'gulp';
import imagemin, { mozjpeg, optipng } from 'gulp-imagemin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const assetsPath = './assets/'
const paths = {
  img: {
    src: assetsPath + 'img/**/*.{png,jpg,webp,jpeg,gif}',
    sharp: assetsPath + 'img/**/*.{png,jpg,webp,jpeg}',
    dest: assetsPath + 'img/',
    thumbnails: assetsPath + 'img/thumbnails/',
    featured: assetsPath + 'img/featured'
  },
}

/* Use it with: npx gulp post -n '<title of the post>' */
export function post(callback) {
  let args = process.argv;
  let title = args[args.length - 1];
  let filename = new Date().toLocaleDateString('en-CA') + '-' + title.charAt(0).toUpperCase() + title.slice(1).toLowerCase().replace(/ /g, '-') + '.md';
  let content = '---\n' +
    'layout: post\n' +
    'title: ' + title + '\n' +
    'color: rgb(50,50,50)\n' +
    'tags: []\n' +
    '---';
  console.log('[' + new Date().toLocaleTimeString('en-CA', { hour12: false }) + '] File created: _posts/' + filename);
  fs.writeFile(__dirname + '/_posts/' + filename, content, callback);
}

/* Use it with: npx gulp img */
export function img() {
  return gulp.src(paths.img.src, { encoding: false })
    .pipe(imagemin([
      mozjpeg({ quality: 85, progressive: true }),
      optipng({ optimizationLevel: 5 }),
    ], { verbose: true }))
    .on('error', (err) => {
      console.error('Error optimizing images:', err.toString());
    })
    .pipe(gulp.dest(paths.img.dest))
}


const build = gulp.series(gulp.parallel(img));
export default build;

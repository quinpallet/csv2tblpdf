import gulp from 'gulp';
import fs from 'fs';

const pdfmakePath = './node_modules/pdfmake';
const fontsEN  = './node_modules/roboto-npm-webfont/full/fonts/Roboto-{Regular,Medium,Bold,Italic}.ttf';
const fontsJP = './node_modules/typeface-mplus-1p/fonts/mplus-1p-{regular,medium,bold}.ttf';

const fontsDestPath = pdfmakePath + '/examples/fonts';

gulp.task('copyFontsEN', function () {
	return gulp.src(fontsEN)
        .pipe(gulp.dest(fontsDestPath));
});

gulp.task('copyFontsJP', function () {
	return gulp.src(fontsJP)
        .pipe(gulp.dest(fontsDestPath));
});

gulp.task('copyFonts', gulp.parallel('copyFontsEN', 'copyFontsJP'));

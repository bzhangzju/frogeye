var gulp = require("gulp"),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    del = require("del"),
    runSequence = require("run-sequence");

gulp.task("clean", function () {
    return del(["dist"]);
});

gulp.task("js", function () {
    gulp.src("src/**/*.js")
        .pipe(gulp.dest("dist"));
});

gulp.task("minify-js", function () {
    return gulp.src("src/**/*.js")
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task("default", function (callback) {
    runSequence("clean", ["js", "minify-js"], callback);
});


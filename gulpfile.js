const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("compile", function() {
	return tsProject
		.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest("dist"));
});

gulp.task("copy", function() {
	return gulp.src("./src/**/*.json").pipe(gulp.dest("dist"));
});

gulp.task("build", gulp.series("compile", "copy"));

gulp.task("watch", () => gulp.watch("src/*", gulp.series("compile", "copy")));


var gulp = require('gulp');
var clean = require('gulp-clean');
var rev = require('gulp-rev-append');
var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var htmlmin = require('gulp-htmlmin');

var less = require('gulp-less');
var cssmin = require('gulp-minify-css');
var cssver = require('gulp-make-css-url-version');

var uglify = require('gulp-uglify');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');

var baseDir = './';

//['./dist/css', './dist/fonts', './dist/js', './dist/images', './dist/*.html']
var cleanSrc = './dist/*';

var srcLess = './src/less/**/*.less',
    distLess = './dist/lessCss';

var srcHtml = './**/*.html',
    distHtml = 'dist';

var srcCss = './src/css/**/*.css',
    distCss = 'dist/css';

var srcJs = './src/js/**/*.js',
    distJs = './dist/js';

var srcImg = './src/img/**/*.{png,jpg,gif,ico}',
    distImg = './dist/img';



//------------------------------clean dist 目录--------------------------------------
gulp.task('clean', function() {
    return gulp.src(cleanSrc, {
            read: false
        })
        .pipe(clean());
});
//------------------------------给页面的引用添加版本号，清除页面引用缓存--------------------------------------
//使用gulp-rev-append给页面的引用添加版本号，清除页面引用缓存。
//gulp-rev-append 插件将通过正则(?:href|src)=”(.*)[?]rev=(.*)[“]查找并给指定链接填加版本号
//（默认根据文件MD5生成，因此文件未发生改变，此版本号将不会变）
//在需要防止缓存的静态资源手动加上标识
//<script src="js/js-one.js?rev=@@hash"></script>
gulp.task('testRev', function() {
    gulp.src(srcHtml)
        .pipe(rev())
        .pipe(gulp.dest(distHtml));
});

//------------------------------编译less文件--------------------------------------
// 1. 基本使用, 编译单个文件 
// 'src/less/index.less'

// 2. 多个文件以数组形式传入
// ['src/less/index.less','src/less/detail.less']

// 3. 匹配符“!”，“*”，“**”，“{}”
// 编译src目录下的所有less文件,除了reset.less和test.less（**匹配src/less的0个或多个子文件夹）
// ['src/less/*.less', '!src/less/**/{reset,test}.less']

//确保本地已安装gulp-sourcemaps [npm install gulp-sourcemaps --save-dev]
//当发生异常时提示错误 确保本地安装gulp-notify和gulp-plumber

gulp.task('testLess', function() {
    gulp.src(srcLess)
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(distLess));
});

gulp.task('testWatch', function() {
    gulp.watch(srcLess, ['testLess']); //当所有less文件发生改变时，调用testLess任务
});

//------------------------------html压缩--------------------------------------
//使用gulp-htmlmin压缩html，可以压缩页面javascript、css，去除页面空格、注释，删除多余属性等操作。

gulp.task('testHtmlmin', function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    gulp.src(srcHtml)
        .pipe(htmlmin(options))
        .pipe(gulp.dest(distHtml));
});

//------------------------------css压缩--------------------------------------
//确保本地已安装gulp-minify-css [npm install gulp-minify-css --save-dev]
//使用gulp-minify-css压缩css文件，减小文件大小，并给引用url添加版本号避免缓存。
//重要：gulp-minify-css已经被废弃，请使用gulp-clean-css，用法一致。

//3.1、基本使用
gulp.task('testCssmin', function() {
    gulp.src(srcCss)
        .pipe(cssmin())
        .pipe(gulp.dest(distCss));
});

//3.2、gulp-minify-css 最终是调用clean-css，其他参数查看这里
//https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-api
gulp.task('testCssmin1', function() {
    gulp.src(srcCss)
        .pipe(cssmin({
            advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
                //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest(distCss));
});

//3.3、给css文件里引用url加版本号（根据引用文件的md5生产版本号）
//确保已本地安装gulp-make-css-url-version [npm install gulp-make-css-url-version --save-dev]
gulp.task('testCssmin2', function() {
    gulp.src(srcCss)
        .pipe(cssver()) //给css文件里引用文件加版本号（文件MD5）
        .pipe(cssmin())
        .pipe(gulp.dest(distCss));
});

// 3.3、若想保留注释，这样注释即可：
/*!
   Important comments included in minified output.
*/

//------------------------------js压缩--------------------------------------
//使用gulp-uglify压缩javascript文件，减小文件大小
//3.1、基本使用
gulp.task('jsmin', function() {
    gulp.src(srcJs)
        .pipe(uglify())
        .pipe(gulp.dest(distJs));
});

//3.2、压缩多个js文件
//gulp.src(['src/js/index.js','src/js/detail.js']) //多个文件以数组形式传入

//3.3、匹配符“!”，“*”，“**”，“{}”
//压缩src/js目录下的所有js文件
//除了test1.js和test2.js（**匹配src/js的0个或多个子文件夹）
//gulp.src(['src/js/*.js', '!src/js/**/{test1,test2}.js']) 

//3.4、指定变量名不混淆改变
gulp.task('jsmin1', function() {
    gulp.src(srcJs)
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {
                except: ['require', 'exports', 'module', '$']
            } //排除混淆关键字
        }))
        .pipe(gulp.dest(distJs));
});
//3.5、gulp-uglify其他参数 具体参看
//https://github.com/terinjokes/gulp-uglify#user-content-options
gulp.task('jsmin2', function() {
    gulp.src(srcJs)
        .pipe(uglify({
            mangle: true, //类型：Boolean 默认：true 是否修改变量名
            compress: true, //类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        }))
        .pipe(distJs);
});

//------------------------------文件合并--------------------------------------
//使用gulp-concat合并javascript文件，减少网络请求。

gulp.task('testConcat', function() {
    gulp.src(srcJs)
        .pipe(concat('all.js')) //合并后的文件名
        .pipe(gulp.dest(distJs));
});



//------------------------------图片压缩--------------------------------------
//使用gulp-imagemin压缩图片文件（包括PNG、JPEG、GIF和SVG图片）
//确保本地已安装imagemin-pngquant [npm install imagemin-pngquant --save-dev]
//使用pngquant深度压缩png图片的imagemin插件
//3.1、基本使用
gulp.task('testImagemin', function() {
    gulp.src(srcImg)
        .pipe(imagemin())
        .pipe(gulp.dest(distImg));
});

//3.2、gulp-imagemin其他参数 具体参看
//https://github.com/sindresorhus/gulp-imagemin#user-content-options
gulp.task('testImagemin1', function() {
    gulp.src(srcImg)
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest(distImg));
});

//3.3、深度压缩图片
gulp.task('testImagemin2', function() {
    gulp.src(srcImg)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        }))
        .pipe(gulp.dest(distImg));
});

//3.4、只压缩修改的图片。压缩图片时比较耗时，在很多情况下我们只修改了某些图片，没有必要压缩所有图片，
//使用”gulp-cache”只压缩修改的图片，没有修改的图片直接从缓存文件读取（C:\Users\Administrator\AppData\Local\Temp\gulp-cache）。
//确保本地已安装gulp-cache [npm install gulp-cache --save-dev]
gulp.task('testImagemin', function() {
    gulp.src(srcImg)
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(distImg));
});

//------------------------------自动刷新页面--------------------------------------
//gulp-livereload拯救F5！当监听文件发生变化时，浏览器自动刷新页面。
//【事实上也不全是完全刷新，例如修改css的时候，不是整个页面刷新，而是将修改的样式植入浏览器，非常方便。】
//特别是引用外部资源时，刷新整个页面真是费时费力。
//http://www.browsersync.cn/

// 监视文件改动并重新载入
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: baseDir
    }
  });

  gulp.watch([srcHtml, srcCss,srcJs], {cwd: baseDir}, reload);
});


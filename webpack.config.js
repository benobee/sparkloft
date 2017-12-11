/****************************************/
/*******     WEBPACK CONFIG     *********/
/****************************************/

const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

/****************************************/
/*******     CONFIG OBJECT      *********/
/****************************************/

const WEBPACK_CONFIG = { module: {} };

/****************************************/
/*******      ENVRIONMENTS      *********/
/****************************************/

/*
 * test whether the script will be run in
 * production using "npm run build" from
 * the terminal. If true, file names will
 * be hashed, js will be minified.
 */

const isProduction = JSON.parse(process.env.PROD_ENV ? true : false);

/***************************************/
/*********       INPUT        **********/
/***************************************/
const input = {
    context: __dirname,
    entry: ['./main.js', './main.less'],
    devtool: isProduction ? '' : 'eval',
    node: {
        dns: 'mock',
        net: 'mock',
        fs: 'empty'
    },
    resolve: {
        alias: {
            'masonry': 'masonry-layout',
            'isotope': 'isotope-layout',
            'vue': 'vue/dist/vue.min.js'
        }
    }
};

//extend properties to config
Object.assign(WEBPACK_CONFIG, input);

/****************************************/
/********   LOADERS / RULES   ***********/
/****************************************/

/*
 * each loader will push to this rules
 * array then added to WEBPACK_CONFIG.
 */

const rules = [];

/*********************/
// @rule: JS
const JSRules = {
    enforce: 'pre',
    test: /\.js$/,
    exclude: /node_modules/,
    use: [
        "babel-loader",
        {
            loader: "eslint-loader",
            options: {
                emitWarning: true,
                fix: true
            }
        },
    ]
};

rules.push(JSRules);

//@rule: Vue
const vueRules = {
    test: /\.vue$/,
    use: [{
        loader: 'vue-loader',
        options: {
            extractCSS: true
        }
    }]
}

rules.push(vueRules);

/*********************/

// @rule: extract all less, compile and apply post css prefixing
const lessRules = {
    test: /\.less$/,
    exclude: /node_modules/,
    use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
                loader: 'css-loader',
            },
            {
                loader: 'postcss-loader',
            },
            {
                loader: 'less-loader',
            }
        ]
    })
};

rules.push(lessRules);

/*********************/

// @rule: css autoprefixer
const CSSRules = {
    test: /\.css$/,
    use: [
        'style-loader',
        {
            loader: 'postcss-loader',
        }
    ]
};

rules.push(CSSRules);

/*********************/

// @rule: json
const JSONRules = {
    test: /\.json$/,
    use: "json-loader"
};

rules.push(JSONRules);

/*********************/

WEBPACK_CONFIG.module.rules = rules;

/***************************************/
/**********      PLUGINS      **********/
/***************************************/

/*
 * each plugin will push to this plugins
 * array. Some will only be pushed when
 * config is set to production. 
 */

const plugins = [];

/*********************/

// @plugin: node env
const nodeENV = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify('production')
    }
});

isProduction ? plugins.push(nodeENV) : false;

/*****************************/

// @plugin: compile all less files into master CSS
const CSSBundle = new ExtractTextPlugin({
    filename: "bundle.css"
});

plugins.push(CSSBundle);

/*********************/

// @plugin: extend jquery for jquery plugins
const jQueryExtend = new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    "window.jQuery": "jquery"
});

plugins.push(jQueryExtend);

/*********************/

// @plugin: handling es6 promises
const promises = new webpack.ProvidePlugin({
    'Promise': 'es6-promise',
    'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
});

plugins.push(promises);

/*********************/

// @plugin: post CSS
const postCSS = [
    require('autoprefixer')
]

postCSS.forEach((item) => {
    plugins.push(item);
});

/*********************/
//@plugin: Vue components
const vueComponents = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: '"production"'
    }
})

if (isProduction) {
    plugins.push(vueComponents);
}

// @plugin: for minifying javascript
const minify = new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    },
    output: {
        comments: isProduction ? false : true,
    },
    minimize: isProduction ? true : false,
    debug: false,
    sourceMap: true,
    minify: isProduction ? true : false,
});

//if production is set, js will be minified
plugins.push(minify);

//output to config object
WEBPACK_CONFIG.plugins = plugins;

/************************************/
/********       OUTPUT        *******/
/************************************/
const output = {
    output: {
        publicPath: '/',
        path: __dirname + "/template/assets",
        filename: "bundle.js"
    }
};

//extend properties to config
Object.assign(WEBPACK_CONFIG, output);

//export config
module.exports = WEBPACK_CONFIG;
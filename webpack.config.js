const path = require('path');
const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');
const merge = require('webpack-merge');

// module.exports = {
//     entry: "./src/index.ts",
//     output: {
//         filename: "./lib/index.js"
//     },

//     // Enable sourcemaps for debugging webpack's output.
//     devtool: "source-map",

//     resolve: {
//         // Add '.ts' and '.tsx' as resolvable extensions.
//         extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
//     },

//     module: {
//         loaders: [
//             // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
//             { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
//         ],

//         preLoaders: [
//             // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
//             { test: /\.js$/, loader: "source-map-loader" }
//         ]
//     },

//     // Other options...
// };

module.exports = (env) => {
    const isDevBuild = !(env && env.prod);

    // Configuration in common to both client-side and server-side bundles
    const sharedConfig = () => ({
        stats: { modules: true },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx']
        },
        output: {
            libraryTarget: "umd",
            filename: '[name].js',
            publicPath: 'lib/' // Webpack dev middleware, if enabled, handles requests for this URL prefix
        },
        module: {
            rules: [
                { test: /\.(tsx|ts)?$/, include: /src/, use: 'awesome-typescript-loader' }
            ]
        },
        plugins: [
            new CheckerPlugin()
        ],
        watchOptions: {
            poll: true
        }
    });

    // Configuration for client-side bundle suitable for running in browsers
    const clientBundleOutputDir = './lib/';
    const clientBundleConfig = merge(sharedConfig(), {
        entry: "./src/index.ts",
        output: { path: path.join(__dirname, clientBundleOutputDir) },
        plugins: [].concat(isDevBuild ? [
            // Plugins that apply in development builds only
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map', // Remove this line if you prefer inline source maps
                moduleFilenameTemplate: path.relative(clientBundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
            })
        ] : [
                // Plugins that apply in production builds only
                new webpack.optimize.UglifyJsPlugin()
            ])
    });

    return clientBundleConfig;
};
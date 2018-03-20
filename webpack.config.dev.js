const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");

module.exports = {
    devtool: "source-map",
    entry: {
        "bundle1": "./src/index",
        "eventsBundle": "./src/events/index",
        "stepSequencer": "./src/stepSequencer/index",
        "preludes": "./src/preludes/index",
        "transport": [
            'react-hot-loader/patch',
            // activate HMR for React

            `webpack-dev-server/client?http://localhost:${3000}`,
            // bundle the client for webpack-dev-server
            // and connect to the provided endpoint

            'webpack/hot/only-dev-server',
            "./src/transport/transport"
        ]
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
    plugins:[
        new DashboardPlugin({
            port: 3001
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./index.html",
            chunks: ["bundle1"]
        }),
        new HtmlWebpackPlugin({
            filename: "events.html",
            template: "./src/events/index.html",
            chunks: ["eventsBundle"]
        }),
        new HtmlWebpackPlugin({
            filename: "stepSequencer.html",
            template: "./src/events/index.html",
            chunks: ["stepSequencer"]
        }),
        new HtmlWebpackPlugin({
            filename: "transport.html",
            template: "./src/transport/index.html",
            chunks: ["transport"]
        }),
        new HtmlWebpackPlugin({
            filename: "preludes.html",
            template: "./src/preludes/preludes.html",
            chunks: ["preludes"]
        })
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ["babel-loader"],
            include: path.join(__dirname, "src")
        }, {
            test: /\.html/,
            loader: "raw-loader"
        }]
    },
    devServer: {
        index: "preludes.html",
        contentBase: "./dist"
    },
    node: {
        fs: 'empty'
    }
}

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");

module.exports = {
    devtool: "source-map",
    entry: {
        "bundle1": "./src/index",
        "eventsBundle": "./src/events/index",
        "stepSequencer": "./src/stepSequencer/index"
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
        contentBase: "./dist"
    }
}

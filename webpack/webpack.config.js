const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        background: path.resolve(__dirname, "..", "src", "background.ts"),
        popup: path.resolve(__dirname, "..", "src", "popup.ts"),
        util: path.resolve(__dirname, "..", "src", "loggingUtil.ts"),
    },
    output: {
        path: path.join(__dirname, "../build"),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "public"}]
        }),
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "icons"}]
        }),
    ],
};
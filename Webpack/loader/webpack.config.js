const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
module.exports = {
    entry: {
        index: './resource/index.js',
    },     
    output: {
        filename: '[name].bundle.js', 
        path: path.resolve(__dirname, 'dist')  
    },    
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: 'images',
                },
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sprite-smith-loader'
                ],
            },
        ],
    },   
    resolveLoader: {
        // tell webpack where to find modules
        modules: ['node_modules', path.join(__dirname, './loaders')],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),  
        new HtmlWebpackPlugin({
            template: './resource/index.html',  
        }),
    ],
    devServer: {
        hot: true,                
        contentBase: './dist',     
        port: 4000,                
        https: false,              
        open: true                 
    },
}
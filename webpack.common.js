const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry:{
        index: './src/js/index.js',
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: './src/template.html',
        }),
    ],
    module:{
        rules:[
            {
                test: /\.css$/i,
                use:['style-loader','css-loader'],
            },
            {
                test: /\.(scss)$/,
                use: [
                  {
                    loader: 'style-loader'
                  },
                  {
                    loader: 'css-loader'
                  },
                  {
                    loader: 'postcss-loader',
                    options: {
                      postcssOptions: {
                        plugins: () => [
                          require('autoprefixer')
                        ]
                      }
                    }
                  },
                  {
                    loader: 'sass-loader'
                  }
                ]
            },
        ],
    },
};
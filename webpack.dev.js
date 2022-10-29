const path = require('path');
const common = require("./webpack.common");
const {merge} = require("webpack-merge");

module.exports = merge(common,{
    mode: 'development',
    devtool: 'inline-source-map',
    output:{
        filename: "[name].bundle.js",
        path: path.resolve(__dirname,"dist"),
    },
    devServer:{
        setupMiddlewares: (middlewares, devServer) => {
            middlewares.push((req, res) => {
              res.send('Hello World!');
            });
            return middlewares;
          },
        port:8080,
        open:true,
        compress:true,
        hot:true,
        liveReload:true,
        watchFiles:["src/*.html"],
    },
});
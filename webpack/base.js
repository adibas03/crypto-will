const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const settings = {
  entry: ["@babel/polyfill", "./src/index.js"],
  output: {
    filename: "js/[name].js",
    publicPath: "./",
    path: path.resolve("dist")
  },
  resolve: {
    extensions: [".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
        // exclude: path.resolve(__dirname, 'node_modules')
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
        // exclude: path.resolve(__dirname, 'node_modules')
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader"
          },
          {
            loader: "postcss-loader",
            options: {
              importLoaders: 1,
              plugins: () => [
                require("autoprefixer")({browsers: ["last 3 versions"]})
              ]
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?)$/,
        loader: "url-loader?limit=10000"
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ttf|eot)$/,
        loader: "file-loader?name=[name].[ext]?[hash]"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/www/index.html"
    }),
    new CopyPlugin([
      {
        from: "src/www/404.html"
      }
    ])
  ]
};

module.exports = settings;

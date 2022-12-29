const path = require("path")
const webpack = require('webpack')

module.exports = {
  resolve: {
    alias: {
      process: "process/browser"
    },
    fallback: {
      'process/browser': require.resolve('process/browser'),
      "zlib": require.resolve("browserify-zlib"),
      "tty": require.resolve("tty-browserify"),
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "assert": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url/"),
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify")
    }
  },
  entry: {
    app: "./src/js/index.js",
    countdown: "./src/js/countdown.js",
    charts: "./src/js/charts.js",
    darkMode: "./src/js/dark-mode.js",
    lightbox: "./src/js/lightbox.js"
  },
  mode: "development",
  devServer: {
    static: "dist",
    watchFiles: ["src/**/*"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.css$/i,
        include: [path.resolve(__dirname, "node_modules"), path.resolve(__dirname, "src/css")],
        use: ["style-loader", "css-loader", "postcss-loader"]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  output: {
    filename: "js/[name].bundle.js",
    path: path.resolve(__dirname, "./dist"),
    assetModuleFilename: "assets/[hash][ext][query]"
  }
}

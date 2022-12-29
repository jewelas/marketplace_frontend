const path = require("path")
const config = require("./webpack.config")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  ...config,
  mode: "production",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/style.css"
    })
  ],
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
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"]
      },
      {
        test: /\.svg/,
        type: "asset/inline"
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "fonts/[hash][ext][query]"
        }
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "img/[hash][ext][query]"
        }
      }
    ]
  }
}

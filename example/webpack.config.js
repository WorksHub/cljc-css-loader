/* global module, require, __dirname */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: {
    'styles': './styles/main.sass',
  },
  output: {
    path: path.resolve(__dirname, 'server/resources'),
    filename: '[name].min.js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './[name]-result.css',
      chunkFilename: '[id].css'
    })
  ],
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.sass$/,
        include: [path.resolve(__dirname, 'styles')],
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'cljc-css-loader',
            options: {
              path: path.resolve(__dirname, 'cljc/styles'),
              nsPrefix: 'styles'
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  }
};

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',

  entry: {
    script: './src/script.js',
  },

  output: {
    publicPath: '/',
    filename: '[name].js',
    sourceMapFilename: 'maps/[name].js.map',
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
  },

  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.pug$/,
        use: {
          loader: 'pug-loader',
          options: {
            pretty: true,
          },
        },
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-strict-mode'],
          },
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: 'head',
      filename: 'index.html',
      template: './src/index.pug',
      chunks: ['script'],
    }),
  ],
};

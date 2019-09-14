const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',

  entry: {
    index: './src/script.js',
    hangman: './src/games/hangman/script.js',
    canvas: './src/experiments/canvas/script.js',
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
        test: /\.txt$/,
        use: 'raw-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'lib/[name].[ext]',
            },
          },
          'extract-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        use: 'pug-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
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
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      inject: 'head',
      filename: 'games/hangman/index.html',
      template: './src/games/hangman/index.pug',
      chunks: ['hangman'],
    }),
    new HtmlWebpackPlugin({
      inject: 'head',
      filename: 'experiments/canvas/index.html',
      template: './src/experiments/canvas/index.pug',
      chunks: ['canvas'],
    }),
  ],
};

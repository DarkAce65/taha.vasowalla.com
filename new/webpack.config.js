const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',

  stats: { version: false, entrypoints: false },

  entry: {
    index: './src/script.js',
    hangman: './src/games/hangman/script.js',
    canvas: './src/experiments/canvas/script.js',
    fireball: './src/experiments/fireball/script.js',
    shaders: './src/experiments/shaders/script.js',
  },

  output: {
    publicPath: '/',
    filename: '[name].js',
    sourceMapFilename: 'maps/[name].js.map',
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: { chunks: 'all' },
  },

  module: {
    strictExportPresence: true,
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      {
        test: /\.css$/,
        use: [
          { loader: 'file-loader', options: { name: 'lib/[name].[ext]' } },
          'extract-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|svg)$/,
        use: [{ loader: 'file-loader', options: { name: 'fonts/[name].[ext]' } }],
      },
      { test: /\.pug$/, use: 'pug-loader' },
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader', 'eslint-loader'] },
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
    new HtmlWebpackPlugin({
      inject: 'head',
      filename: 'experiments/fireball/index.html',
      template: './src/experiments/fireball/index.pug',
      chunks: ['fireball'],
    }),
    new HtmlWebpackPlugin({
      inject: 'head',
      filename: 'experiments/shaders/index.html',
      template: './src/experiments/shaders/index.pug',
      chunks: ['shaders'],
    }),
  ],
};

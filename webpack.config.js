const path = require('path');

const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { ProvidePlugin } = require('webpack');

const { DEST_DIR } = require('./build.config');

const pages = {
  index: { dir: '.', entry: './script.ts' },
  about: { dir: 'about', entry: './script.ts' },
  animation: { dir: 'random/animation', entry: './script.js' },
  cards: { dir: 'visual/cards', entry: './script.ts' },
  chemistry: { dir: 'projects/chemistry', entry: './script.js' },
  driving: { dir: 'projects/driving', entry: './script.ts' },
  fireball: { dir: 'random/fireball', entry: './script.js' },
  hangman: { dir: 'games/hangman', entry: './script.ts' },
  minesweeper: { dir: 'games/minesweeper', entry: './script.js' },
  shaders: { dir: 'random/shaders', entry: './script.js' },
  testing: { dir: 'random/testing', entry: './script.ts' },
  ultimatettt: { dir: 'games/ultimatettt', entry: './script.js' },
  webaudio2d: { dir: 'visual/webaudio2d', entry: './script.ts' },
  webaudio3d: { dir: 'visual/webaudio3d', entry: './script.ts' },
  wordsearch: { dir: 'projects/wordsearch', entry: './script.ts' },
};

const entrypoints = Object.entries(pages).reduce(
  (acc, [entryName, { dir, entry }]) => ({
    ...acc,
    [entryName]: path.join(__dirname, 'src', dir, entry),
  }),
  {}
);

const pagePlugins = Object.entries(pages).map(([entryName, { dir, chunks = [entryName] }]) => {
  return new HtmlWebpackPlugin({
    inject: 'head',
    filename: path.posix.join(dir, 'index.html'),
    template: path.join(__dirname, 'src', dir, 'index.pug'),
    chunks,
  });
});

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',

  stats: {
    assetsSort: 'name',
    assetsSpace: 20,
    cached: false,
    cachedAssets: false,
    cachedModules: false,
    chunks: false,
    colors: true,
    excludeAssets: /(^lib|.map$)/,
    modules: false,
    version: false,
  },

  devServer: {
    hot: false,
    host: '0.0.0.0',
    port: 5000,
    static: {
      directory: path.join(__dirname, DEST_DIR),
      watch: true,
    },
    client: {
      overlay: false,
    },
  },

  entry: entrypoints,
  context: path.resolve(__dirname, 'src'),

  output: {
    publicPath: process.env.PUBLIC_PATH || '/',
    filename: '[name].[contenthash:5].js',
    sourceMapFilename: 'maps/[file].map[query]',
  },

  optimization: {
    usedExports: true,
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        three: { name: 'vendor~three', test: /[\\/]node_modules[\\/]three/, priority: 10 },
        uikit: { name: 'vendor~uikit', test: /[\\/]node_modules[\\/]uikit/, priority: 10 },
        shared: { name: 'vendors~shared', test: /[\\/]node_modules/, minChunks: 6 },
      },
    },
  },

  module: {
    strictExportPresence: true,
    rules: [
      { test: /\.pug$/, use: 'pug-loader' },
      { test: /\.tsx?$/, exclude: /node_modules/, use: ['babel-loader', 'ts-loader'] },
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.pdf$/, type: 'asset/resource', generator: { filename: '[path][name][ext]' } },
      { test: /\.(glsl|txt)$/, type: 'asset/source' },
      {
        test: /\.css$/i,
        include: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(woff2?|eot|ttf|png|svg|jpg|gif)$/i,
        type: 'asset',
        include: /node_modules/,
        generator: { filename: 'lib/assets/[name].[contenthash:5][ext]' },
      },
    ],
  },

  resolve: {
    alias: { '~': path.resolve(__dirname, 'src') },
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve(__dirname, 'node_modules')],
    plugins: [new TsconfigPathsPlugin()],
  },

  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new ESLintPlugin({ extensions: ['js', 'ts'] }),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      filename: '403.html',
      template: path.join(__dirname, 'src', '403.pug'),
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      filename: '404.html',
      template: path.join(__dirname, 'src', '404.pug'),
      chunks: [],
    }),
    ...pagePlugins,
  ],
};

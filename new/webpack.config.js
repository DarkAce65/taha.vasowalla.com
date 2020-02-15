const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pages = [
  { entry: 'index', dir: '' },
  { entry: 'hangman', dir: 'games/hangman' },
  { entry: 'canvas', dir: 'experiments/canvas' },
  { entry: 'fireball', dir: 'experiments/fireball' },
  { entry: 'shaders', dir: 'experiments/shaders' },
  { entry: 'cards', dir: 'visual/cards' },
  { entry: 'webaudio2d', dir: 'visual/webaudio2d' },
  { entry: 'webaudio3d', dir: 'visual/webaudio3d' },
];

const entrypoints = pages.reduce(
  (acc, { entry, dir }) => ({
    ...acc,
    [entry]: path.join(__dirname, 'src', dir, 'script.js'),
  }),
  {}
);

const plugins = pages.map(({ entry, dir, chunks = [entry] }) => {
  return new HtmlWebpackPlugin({
    inject: 'head',
    filename: path.join(dir, 'index.html'),
    template: path.join(__dirname, 'src', dir, 'index.pug'),
    chunks,
  });
});

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',

  stats: {
    assetsSort: 'chunks',
    version: false,
    entrypoints: false,
  },

  devServer: {
    publicPath: '/',
    host: '0.0.0.0',
    port: 5000,
    contentBase: path.join(__dirname, 'dist'),
    watchContentBase: true,
    stats: {
      assetsSort: 'chunks',
      excludeAssets: /.map$/,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      cached: false,
      cachedAssets: false,
      chunkModules: false,
      chunks: false,
      entrypoints: false,
      modules: false,
    },
  },

  entry: entrypoints,

  output: {
    publicPath: process.env.PUBLIC_PATH || '/',
    filename: '[name].js',
    sourceMapFilename: 'maps/[name].js.map',
  },

  optimization: {
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

  plugins,
};

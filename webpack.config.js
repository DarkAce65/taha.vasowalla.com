const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const { DEST_DIR } = require('./build.config');

const pages = [
  { entry: 'index', dir: '' },
  { entry: 'about', dir: 'about' },
  { entry: 'hangman', dir: 'games/hangman' },
  { entry: 'minesweeper', dir: 'games/minesweeper' },
  { entry: 'ultimatettt', dir: 'games/ultimatettt' },
  { entry: 'canvas', dir: 'random/canvas' },
  { entry: 'fireball', dir: 'random/fireball' },
  { entry: 'shaders', dir: 'random/shaders' },
  { entry: 'testing', dir: 'random/testing' },
  { entry: 'chemistry', dir: 'projects/chemistry' },
  { entry: 'cards', dir: 'visual/cards' },
  { entry: 'webaudio2d', dir: 'visual/webaudio2d' },
  { entry: 'webaudio3d', dir: 'visual/webaudio3d' },
];

const entrypoints = pages.reduce(
  (acc, { entry, dir }) => ({
    ...acc,
    [entry]: path.join(process.cwd(), 'src', dir, 'script.js'),
  }),
  {}
);

const pagePlugins = pages.map(({ entry, dir, chunks = [entry] }) => {
  return new HtmlWebpackPlugin({
    inject: 'head',
    filename: path.posix.join(dir, 'index.html'),
    template: path.join(process.cwd(), 'src', dir, 'index.pug'),
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
    contentBase: path.join(process.cwd(), DEST_DIR),
    watchContentBase: true,
    stats: {
      assetsSort: 'chunks',
      excludeAssets: /(^lib|.map$)/,
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
    filename: '[name].[contenthash:5].js',
    sourceMapFilename: 'maps/[name].js.map',
  },

  optimization: {
    usedExports: true,
    moduleIds: 'hashed',
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
      {
        test: /\.css$/,
        sideEffects: true,
        include: /node_modules/,
        use: [
          { loader: 'file-loader', options: { name: 'lib/css/[name].[ext]' } },
          'extract-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|png|svg|jpg|gif)$/,
        sideEffects: true,
        include: /node_modules/,
        loader: 'file-loader',
        options: { name: 'lib/assets/[name].[ext]', esModule: false },
      },
      { test: /\.pdf$/, loader: 'file-loader', options: { name: '[name].[ext]', esModule: false } },
      { test: /\.(glsl|txt)$/, sideEffects: true, use: 'raw-loader' },
      { test: /\.pug$/, use: 'pug-loader' },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: { configFile: path.resolve(__dirname, '.eslintrc.js') },
      },
      { test: /\.tsx?$/, exclude: /node_modules/, use: ['babel-loader', 'ts-loader'] },
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader', 'eslint-loader'] },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve(__dirname, 'node_modules')],
    plugins: [new TsconfigPathsPlugin()],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: '403.html',
      template: path.join(process.cwd(), 'src', '403.pug'),
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      filename: '404.html',
      template: path.join(process.cwd(), 'src', '404.pug'),
      chunks: [],
    }),
    ...pagePlugins,
  ],
};

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',

  output: {
    filename: '[name].js',
    sourceMapFilename: 'maps/[name].js.map',
  },

  optimization: {
    usedExports: true,
  },

  module: {
    strictExportPresence: true,
    rules: [
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
};

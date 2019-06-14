module.exports = {
  mode: 'development',
  devtool: 'source-map',

  output: {
    filename: '[name].js',
    sourceMapFilename: 'maps/[name].js.map',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env'],
            plugins: ['@babel/plugin-transform-strict-mode'],
          },
        },
      },
    ],
  },
};

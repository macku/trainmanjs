const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');

const libraryName = pkg.name;
const outputFile = `${libraryName}.js`;

const PATHS = {
  SRC: path.resolve(__dirname, 'src'),
  LIB: path.resolve(__dirname, 'lib'),
  MODULES: path.resolve(__dirname, 'node_modules')
};

const config = {
  entry: path.resolve(`${PATHS.SRC}/index.js`),

  devtool: 'source-map',

  output: {
    path: path.resolve(PATHS.LIB),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader'
        }
      }
    ]
  },

  resolve: {
    modules: [
      PATHS.SRC,
      PATHS.MODULES
    ],

    extensions: ['.js']
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      compress: {
        warnings: true
      },
      sourceMap: true
    })
  ]
};

module.exports = config;

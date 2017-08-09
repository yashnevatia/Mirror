var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './reactApp/app.js',
  output: {
    path: path.join(__dirname, '/public/build'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react']
          }
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
};

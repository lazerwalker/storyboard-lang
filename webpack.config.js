const path = require('path');

module.exports = {
  entry: './lib/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ohm$/,
        use: 'raw-loader'
      },
      {
        test: /\.story$/,
        use: 'raw-loader'
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js', '.ohm' ]
  },
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: "storyboard-lang",
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
};
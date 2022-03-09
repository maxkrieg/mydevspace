const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module', 'browser'],
  },
  entry: './src/index.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'tsx',
          target: 'es2020',
        }
      }
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './dist/renderer')
    },
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 4000
  },
  output: {
    path: path.resolve(__dirname, './dist/renderer'),
    filename: 'js/[name].js',
    publicPath: '/',
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
  ],
};
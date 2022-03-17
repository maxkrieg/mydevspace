const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  entry: {
    main: {
      import: "./electron/main.ts",
      dependOn: "preload",
    },
    preload: './electron/preload.ts',
  },
  target: 'electron-main',
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
  ],
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
      },
      // {
      //   test: /\.bin$/,
      //   loader: "binary-loader",
      // },
      {
        test: /\.bin$/,
        // exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              encoding: false,
              mimetype: false,
              generator: (content) => {
                return content;
              }
            },
           },
         ],
      }
    ],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
};
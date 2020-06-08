const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry:
    process.env.NODE_ENV === 'development'
      ? [
          '@babel/polyfill',
          './tools/setup_fetch_mock.js',
          './src/app/frontend/index.js',
        ]
      : ['@babel/polyfill', './src/app/frontend/index.js'],
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false },
          },
        ],
        sideEffects: true,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    // eslint-disable-next-line
    path: path.resolve(__dirname, "build/public"),
    filename: 'bundle.js',
    publicPath: '/__/public/',
  },
  devServer: {
    contentBase: `${__dirname}/tools/`,
    publicPath: '/__/public/',
    historyApiFallback: {
      rewrites: [{ from: '/', to: '/dev_index.html' }],
    },
  },
};

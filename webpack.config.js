module.exports = {
  entry: ['./src/app/frontend/index.js'],
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
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: `${__dirname}/tools/`,
    publicPath: '/__/public/',
    historyApiFallback: {
      rewrites: [{ to: '/dev_index.html' }],
    },
  },
};

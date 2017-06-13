import * as webpack from 'webpack';

const config: webpack.Configuration = {
  entry: [
    'react-hot-loader/patch',
    "./src/index.tsx"
  ],
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist",
    publicPath: "/dist"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    loaders: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/, loaders: [
          "react-hot-loader/webpack",
          "awesome-typescript-loader"
        ]
      },

      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-2']
        }
      }
    ]
  },
};

export default config;

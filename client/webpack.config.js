config = {
  entry: "./src/app.js",
  output: {
    filename: "bundle.js",
    path: "../www/js"
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module:{
    loaders: [
      {
        test: /(\.js|\.jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['react', 'es2015']
        }
      },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  },
  devtool: 'source-map'
}

module.exports = config;


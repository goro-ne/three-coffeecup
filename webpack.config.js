const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './app.js', // 入力元のファイル名(エントリポイント)
  output: {
    filename: 'assets/bundle.js' // 出力先のファイル名
  },
  resolve: {
    extensions: [".js", ".jsx"],
    // 使用したいコントロールやレンダラを定義しておきます。(下記は一例です。使用しないものは除いておいてよいです)
    alias: {
        // glTFローダー
        'three/GLTFLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/GLTFLoader.js'),
        // トラックボール
        'three/TrackballControls': path.join(__dirname, 'node_modules/three/examples/js/controls/TrackballControls.js'),
        // 物体ドラッグ
        'three/DragControls': path.join(__dirname, 'node_modules/three/examples/js/controls/DragControls.js')
        //// カメラ制御
        //'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
    }
  },
  plugins: [
    // THREE.Scene などの形式で three.js のオブジェクトを使用できるようにします。
    new webpack.ProvidePlugin({
        'THREE': 'three/build/three'
    }),
    // minify するようにします。(必要な場合)
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}


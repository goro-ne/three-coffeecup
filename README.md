## glTFの３Dモデルをthree.jsで表示するテスト

### npmのバージョン確認

```
$ npm i -g npm
$ npm --version
5.6.0
```

### 方針

- ES2015、Three.jsを使い、WebGLで3Dモデルをアニメーションさせる。
- 3DモデルはblenderとglTF-Blender-Exporter 2.0 アドオンを使い、glTFフォーマットに変換して読み込む。
- ES2015で動作しないブラウザを考慮して、babelとwebpack3でES5にコンパイルする。



### ES2015のブラウザ対応状況

http://kangax.github.io/compat-table/es6/

- Chromeは62以降
- iOS 10.3以降

### 実行環境

参考サイト  
https://knooto.info/webpack-threejs/

```
project /
　├ package.json
　├ webpack.config.js
　├ assets /
　│ └ bundle.js
　├ models /
　│ └ gltf /
　├ app.js
　└ index.html
```

### npmパッケージ初期化

```
$ npm init -y
```


### webpackのインストール

```
$ npm install webpack -g （すでにインストールしてれば不要）
$ npm install webpack --save-dev
+ webpack@3.10.0
```

### babelのインストール

```
$ npm install babel-loader babel-core babel-preset-es2015 --save-dev
+ babel-loader@7.1.2
+ babel-core@6.26.0
+ babel-preset-es2015@6.24.1
```

### three.jsのインストール

```
$ npm install --save three
+ three@0.89.0
```

### stat.jsのダウンロード

```
$ (cd assets;curl -L "http://rawgit.com/mrdoob/stats.js/master/build/stats.min.js" -O)
```

### blenderでエクスポートした建機3Dモデルをコピーする

[blenderをインストールして、glTFファイルをエクスポートするまで](doc/Install_blender.md)

File: PC200_LiteR1_Render_R4.glb

```
$ mkdir -p models/gltf/kenki
$ cp ~/Documents/work/kenki/PC200_LiteR1_Render_R4.glb models/gltf/kenki/
```

### webpack.config.jsの編集

*webpack.config.js (既にある場合は作成不要)*
```js
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
         // GLTFローダー
         'three/GLTFLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/GLTFLoader.js',
        // トラックボール
        'three/TrackballControls': path.join(__dirname, 'node_modules/three/examples/js/controls/TrackballControls.js'),
        // 物体ドラッグ
        'three/DragControls': path.join(__dirname, 'node_modules/three/examples/js/controls/DragControls.js'),
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
```

### app.js

*app.js (既にある場合は作成不要)*
```js
import 'three/TrackballControls';
import 'three/GLTFLoader';

let container;
let camera, controls, scene, renderer;
let kenki;

init();
animate();

function init(resolve) {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // シーン
    scene = new THREE.Scene();

    // レンダラー
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true; // 影を有効にする
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff);
    container.appendChild( renderer.domElement );

    // 平行光
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set(0, 300, 0 );
    directionalLight.castShadow = true; // 影を投げる
    directionalLight.shadow.camera.near = 100;
    directionalLight.shadow.camera.far = 450;
    directionalLight.shadow.camera.top = 40;
    directionalLight.shadow.camera.bottom = -40;
    directionalLight.shadow.camera.left = 40;
    directionalLight.shadow.camera.right = -40;
    directionalLight.shadow.mapSize.width = 2000;
    directionalLight.shadow.mapSize.height =2000;
    scene.add( directionalLight );

    // 調整光
    const ambientLight = new THREE.AmbientLight( 0xffffff ,0.3);
    scene.add( ambientLight );    

    // 照明
    const spotLight = new THREE.SpotLight(
        0xffffff,    //光の色
        2,           //光の強さ
        2000,        //光の届く距離
        Math.PI / 4, //照らす範囲角
        1,           //光の減衰度合い
    );
    spotLight.castShadow = true; // 影を投げる
    spotLight.position.set( 500, 1000, 700);
    scene.add( spotLight );    
    const spotLightShadowHelper = new THREE.CameraHelper(
        spotLight.shadow.camera
    );
    scene.add( spotLightShadowHelper);

    // 建機を作成
    const url = 'models/gltf/kenki/PC200_LiteR1_Render_R4.glb';
    const loader = new THREE.GLTFLoader();
    // Load a glTF resource
    loader.load( url,
        ( gltf ) => {
            kenki = gltf.scene;
            kenki.traverse (
                ( obj ) => {
                    // マテリアルのみ、影を投げる
                    if ( obj.material ) {
                        obj.castShadow = true;
                        obj.receiveShadow = true;
                    }
                }
            );
            scene.add( kenki );
        },
		( xhr ) => {
			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		( error ) => {
			console.log( 'An error happened' );
		}
    );

    // 床を作成
    const meshFloor = new THREE.Mesh(
        new THREE.BoxGeometry(2000, 0.1, 2000),
        new THREE.MeshStandardMaterial()
    );
    meshFloor.receiveShadow = true; // 影を受ける
    scene.add(meshFloor);

    // カメラ
    let fov = 80;
    let aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( fov, aspect, 1, 10000 );

    camera.position.y = 200;
    camera.position.z = 300;

    // コントロール
    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    // ウィンドウイベント
    window.addEventListener(
        'resize', onWindowResize, false
    );
    return resolve;
}

function onWindowResize( event ) {
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function animate() {
 
    // 建機を回転させる
    if (kenki != undefined) {
        kenki.rotation.y = Date.now() * 0.0005;	
    }
    if (renderer != undefined) {
        render();
    }
    requestAnimationFrame( animate );
}

function render() {
    controls.update();
    renderer.render( scene, camera );
}
```


### webpackでコンパイルテスト

```
$ webpack --display-error-details
Hash: 8275395b0efbc6adfcc5
Version: webpack 3.10.0
Time: 5704ms
           Asset    Size  Chunks                    Chunk Names
assets/bundle.js  572 kB       0  [emitted]  [big]  main
   [1] ./app.js 3.28 kB {0} [built]
    + 3 hidden modules
```

### package.jsonの編集

npmコマンドを追加

*package.json* (既にある場合は作成不要)
```json
{
  "name": "three-simple",
  "version": "1.0.0",
  "description": "test three.js",
  "main": "index.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "build": "webpack",
    "test": "http-server"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/goroutine/three-simple.git"
  },
  "author": "goroutine",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/goroutine/three-simple/issues"
  },
  "homepage": "https://github.com/goroutine/three-simple#readme",
  "dependencies": {
    "@types/jquery": "^3.2.16",
    "jquery": "^3.2.1",
    "three": "^0.88.0"
  },
  "devDependencies": {
    "@types/three": "^0.84.35",
    "http-server": "^0.10.0",
    "ts-loader": "^3.2.0",
    "typescript": "^2.6.2",
    "webpack": "^3.10.0"
  }
}
```

### index.html

*index.html (既にある場合は作成不要)*
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        body {
            margin: 0px;
            overflow: hidden;
        }
    </style>
    <script>
        // stats.js
        (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()
    </script>
    <title></title>
</head>
<body>
    <script src="assets/bundle.js"></script>
</body>
</html>
```



### コンパイル

```
$ npm run build
```

### テストサーバー起動

```
$ npm run test
```


### gitignore

*.gitignore*
```
.DS_Store
npm-debug.log
node_modules
assets/*
models/gltf/kenki/*
!.gitkeep
```

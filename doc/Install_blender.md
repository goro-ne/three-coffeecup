### blenderのインストール

バージョン 2.79
https://www.blender.org/download/


### blenderを日本語化

デフォルトの英語設定だと、プロパティの日本語フォントが読めないので
日本語ローカライズします。

```
1. blenderを開く
2. Info > File > UserPreferences
3. Systemタブの「Interface fonts」をチェックする
4. Languageから「Japanese(日本語)」を選択
5. 「ツールチップ」をクリック
6. ユーザー設定の保存
```

### glTF-Blender-Exporter 2.0のダウンロード

```
$ git clone git@github.com:KhronosGroup/glTF-Blender-Exporter.git
```

### Blender addonディレクトリに io_scene_gltf2ディレクトリをコピー

```
$ cd glTF-Blender-Exporter
$ cp -pR scripts/addons/io_scene_gltf2 ~/Documents/blender/blender.app/Contents/Resources/2.79/scripts/addons/
```

### glTF-Blender-Exporter 2.0 アドオンを追加

```
1. blenderを開く
2. 情報 > ファイル > アドオン > ユーザー設定
3. 「Import-Export: glTF 2.0 format」をチェックする
4. ユーザー設定の保存
```

### 3DモデルのglTF2.0書き出し

```
1. .blendファイルを開く
2. 情報 > ファイル > エクスポート > glTF 2.0 (.glb)
3. 書き出すディレクトリを選択し、「Export glTF 2.0」ボタンをクリック
 ファイルが出力される
  〜.glb
```

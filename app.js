import 'three/TrackballControls';
import 'three/GLTFLoader';

let container;
let camera, controls, scene, renderer;
let coffeecup;

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

  // コーヒーカップを作成
  const url = 'models/gltf/turntable/CoffeeCup.glb';
  const loader = new THREE.GLTFLoader();
  // Load a glTF resource
  loader.load( url,
    ( gltf ) => {
      coffeecup = gltf.scene;
      coffeecup.traverse (
        ( object ) => {
          // メッシュのみ、影を投げる
          if ( object instanceof THREE.Mesh ) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        }
      );
      scene.add( coffeecup );
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
 
  // コーヒーカップを回転させる
  if (coffeecup != undefined) {
    coffeecup.rotation.y = Date.now() * 0.0005;  
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

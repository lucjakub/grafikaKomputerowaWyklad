
// Set our main variables
let scene,
renderer,
camera,
model,                      // Our character
neck,                       // Reference to the neck bone in the skeleton
waist,                      // Reference to the waist bone in the skeleton
fileAnimations,             // Animations found in our file
mixer,                      // THREE.js animations mixer
idle,                       // Idle, the default state our character returns to
clock = new THREE.Clock(),  // Used for anims, which run to a clock instead of frame rate 
loaderAnim = document.getElementById('js-loader');
const idleBtn = document.querySelector('button.idle');
const jumpBtn = document.querySelector('button.jump');
const warmupBtn = document.querySelector('button.warmup');
const danceBtn = document.querySelector('button.dance');
const wavingBtn = document.querySelector('button.waving');
const punchingBtn = document.querySelector('button.punching');
const kickingBtn = document.querySelector('button.kicking');
const skeletalBtn = document.querySelector('button.skeletal');

  

  
function init() {
    // Link do modelu https://sketchfab.com/3d-models/geralt-of-rivia-c0c479d36d7d402ea800eddf7b0cac9b?fbclid=IwAR0KNQ0oGSvjuuHMKX7gTWCCmXfKOCPpoLbnKC8pVKtYy6P_CD6jk1rjkJA
    const MODEL_PATH = 'geralt.glb';
    const canvas = document.querySelector('#canvas');
    const backgroundColor = 0xf1f1f1;

    // Init the scene
    scene = new THREE.Scene();
    // Load the texture image
    const backgroundTexture = new THREE.TextureLoader().load('background.jpg');
    scene.background = backgroundTexture;

    // Init the renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Add a camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = 10;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;

    // Texture 
    let geralt_txt = new THREE.TextureLoader().load('texturaBC.jpg');
    geralt_txt.flipY = true;

    const geralt_mtl = new THREE.MeshPhongMaterial({
    map: geralt_txt,
    color: 0xffffff,
    skinning: true });


    // Load Model
    var loader = new THREE.GLTFLoader();

    loader.load(MODEL_PATH, function (gltf) {
        model = gltf.scene;
        fileAnimations = gltf.animations;

        model.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                o.material = geralt_mtl;
            }
            // Reference the neck and waist bones
            if (o.isBone && o.name === 'mixamorigNeck')     neck = o;
            if (o.isBone && o.name === 'mixamorigSpine')    waist = o;
        });

        model.scale.set(2, 2, 2);
        model.position.y = -11;
        scene.add(model);
        loaderAnim.remove();

        mixer = new THREE.AnimationMixer(model);

        let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');
        idleAnim.tracks.splice(3, 3);
        idleAnim.tracks.splice(9, 3);
        idle = mixer.clipAction(idleAnim);
        idle.play();

    },
    undefined,
    function (error) {
    console.error(error);
    });


    // Add lights
    let hemiLight = new THREE.HemisphereLight(0xf2ae02, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xd9bcb4, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    scene.add(dirLight);

    // Load the texture image
    const floorTexture = new THREE.TextureLoader().load('floor.jpg');

    // Create a material with the texture
    const floorMaterial = new THREE.MeshPhongMaterial({
        map: floorTexture,
        shininess: 0,
        side: THREE.DoubleSide, // Added to make both sides of the floor visible
    });
  
  // Adjust the repeat and wrap properties of the floor texture
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(70, 70); // Adjust the repeat values as needed to control the tiling
  
  // Create the floor geometry
  const floorGeometry = new THREE.PlaneGeometry(2048, 2048, 1, 1);
  
  // Create the floor mesh with the geometry and material
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  
  // Set the rotation and position of the floor
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = -11;
  
  // Add the floor to the scene
  scene.add(floor);
}
  
function update() {
    if (mixer) {
    mixer.update(clock.getDelta());
    }

    if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(update);
}
  
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
    canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
    renderer.setSize(width, height, false);
    }
    return needResize;
}

function playOnClick(action) {
    // Stop the current animation
    idle.stop();

    // Find the animation clip for the given action
    let anim = THREE.AnimationClip.findByName(fileAnimations, action);
    if (anim) {
        // Play the new animation
        idle = mixer.clipAction(anim);
        idle.play();
    }
}

function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
}

function moveJoint(mouse, joint, degreeLimit) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
//   console.log(joint.rotation.x);
}

function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)
    // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = xdiff / (w.x / 2) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = degreeLimit * xPercentage / 100 * -1;
    }

    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = xdiff / (w.x / 2) * 100;
    dx = degreeLimit * xPercentage / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = ydiff / (w.y / 2) * 100;
    // Note that I cut degreeLimit in half when she looks up
    dy = degreeLimit * 0.5 * yPercentage / 100 * -1;
    }
    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = ydiff / (w.y / 2) * 100;
    dy = degreeLimit * yPercentage / 100;
    }
    return { x: dx, y: dy };
}

function toggleSkeletalVisibility() {
  const skeletonHelper = scene.getObjectByName('skeletonHelper');
  if (skeletonHelper) {
    skeletonHelper.visible = !skeletonHelper.visible;
  } else {
    // Create the skeleton helper if it doesn't exist
    const skeletonHelper = new THREE.SkeletonHelper(model);
    skeletonHelper.name = 'skeletonHelper';
    scene.add(skeletonHelper);
  }
}

function neckMove(e) {
    var mousecoords = getMousePos(e);
    if (neck && waist) {
        moveJoint(mousecoords, neck, 50);
        moveJoint(mousecoords, waist, 30);
    }
}

init();
update();

document.addEventListener('mousemove', neckMove);
skeletalBtn.addEventListener('click', toggleSkeletalVisibility);
idleBtn.addEventListener('click', e => playOnClick('idle'));
jumpBtn.addEventListener('click', e => playOnClick('jump'));
warmupBtn.addEventListener('click', e => playOnClick('warmup'));
danceBtn.addEventListener('click', e => playOnClick('dance'));
wavingBtn.addEventListener('click', e => playOnClick('waving'));
punchingBtn.addEventListener('click', e => playOnClick('punching'));
kickingBtn.addEventListener('click', e => playOnClick('kicking'));
document.addEventListener('keypress', keyAction)
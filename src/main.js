import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';
import { gsap } from 'gsap';


let canvas = document.getElementById('canvas');

// Create the scene
const scene = new THREE.Scene();

// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 70);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
//document.body.appendChild(renderer.domElement);

//Add HDRI lighting
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_48d_partly_cloudy_puresky_1k.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  //scene.background = texture;
  //scene.background.intensity = 0.1;

});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enabled = true


const loader = new GLTFLoader();
let gltfScene;
let mixer;
let clip;
let action;

loader.load('./untitled.glb', function (gltf) {
  gltfScene = gltf.scene;
  scene.add(gltfScene);

  gltfScene.position.set(0, 0, -40

  );

  animateCamera()

  if (gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(gltfScene);
    clip = gltf.animations[0];
    action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.play();
    console.log("Animation Started");
  } else {
    console.warn("No animations found in the GLB model");
  }

}, undefined, function (error) {
  console.error(error);
});


function animateCamera() {
  const radius = 2; // Distance of camera from the model
  const duration = 5; // Time for each step
  const delay = 3;

  const tl = gsap.timeline({ repeat: 0, ease: "power2.inOut", delay: delay });

  tl.to(camera.position, {
    x: radius * Math.cos(Math.PI / 2),
    z: radius * Math.sin(Math.PI / 2),
    duration: duration,
    onUpdate: () => camera.lookAt(gltfScene.position),
  })
    .to(camera.position, {
      x: radius * Math.cos(Math.PI),
      z: radius * Math.sin(Math.PI),
      duration: duration,
      onUpdate: () => camera.lookAt(gltfScene.position),
    })
    .to(camera.position, {
      x: radius * Math.cos((3 * Math.PI) / 2),
      z: radius * Math.sin((3 * Math.PI) / 2),
      duration: duration,
      onUpdate: () => camera.lookAt(gltfScene.position),
    })
    .to(camera.position, {
      x: radius * Math.cos(Math.PI * 2),
      z: radius * Math.sin(Math.PI * 2),
      duration: duration,
      onUpdate: () => camera.lookAt(gltfScene.position),
      //onComplete: () => {
      //   console.log("Animation completed, model paused.");
      // tl.pause(); // Pause the timeline at the last frame
      // }
    })
    .to(camera.position, {
      x: radius * Math.cos((5 * Math.PI) / 2),
      z: radius * Math.sin((5 * Math.PI) / 2),
      duration: duration,
      onUpdate: () => camera.lookAt(gltfScene.position),
    })
    .to(gltfScene.position, {
      z: 2,
      duration: duration,
      onComplete: () => {
        tl.pause()
        controls.enableZoom = true;
        controls.enabled = true
      }

    })
}




let animationRunning = true;

// Create scroll bar and animation button.
// let scrollBar = document.getElementById('scrollBar')
// scrollBar.type = 'range';
// scrollBar.min = '0';
// scrollBar.max = '1';
// scrollBar.step = '0.001';
// scrollBar.value = '0';
// scrollBar.style.position = 'absolute';
// scrollBar.style.bottom = '20px';
// scrollBar.style.left = '20px';
// scrollBar.style.width = '800px';


// let animationButton = document.getElementById('animationButton');
// animationButton.textContent = '⏹️';
// animationButton.style.position = 'absolute';



// scrollBar.addEventListener('input', () => {
//   if (mixer && clip) {
//     mixer.setTime(clip.duration * parseFloat(scrollBar.value));
//   }
// });

// animationButton.addEventListener('click', () => {
//   animationRunning = !animationRunning;
//   animationButton.textContent = animationRunning ? '⏹️' : '▶️';

//   if (mixer) {
//     if (animationRunning) {
//       mixer.timeScale = 1; //Resume animation
//     } else {
//       mixer.timeScale = 0; //Pause animation
//     }
//   }
// });

// Animate the Camera (Using GSAP)
// function animateCamera() {
//   gsap.to(camera.position, {
//       x: 5,  // Move right
//       y: 3,  // Move up
//       z: 8,  // Move back
//       duration: 5,
//       ease: "power2.inOut",
//       repeat: -1,  // Loop infinitely
//       yoyo: true   // Move back and forth
//   });
// }

//animateCamera(); // Start the camera animation





// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.render(scene, camera);

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  controls.enableZoom = true;
  controls.enabled = true

  if (mixer && clip) {
    if (animationRunning) {
      mixer.update(clock.getDelta());
    }

    //     scrollBar.value = mixer.time / clip.duration;
    if (mixer.time >= clip.duration) {
      mixer.setTime(clip.duration);
      animationRunning = false;
      //animationButton.textContent = '▶️';
      mixer.timeScale = 0;
    }
  }

  renderer.render(scene, camera);
}


animate();
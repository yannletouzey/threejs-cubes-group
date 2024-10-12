import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { fog } from 'three/webgpu';

const colorArray = [
  0xff0000,
  0x00ff00,
  0x0000ff,
  0xffff00,
  0x00ffff,
  0xff00ff,
  0xffffff,
  0x9ff00f,
]
const canvas = document.querySelector('#canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 0.01, 100);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1;
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const getSpherePoint = (radius) => {
  radius += Math.random() * 0.5 + 0.5;
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi)
  }
}

const geometry = new THREE.BoxGeometry();

const getBox = () => {
  const color = colorArray[Math.floor(Math.random() * colorArray.length)];
  const material = new THREE.MeshBasicMaterial({ 
    color 
  });
  const mesh = new THREE.Mesh(geometry, material);
  const { x, y, z } = getSpherePoint(2);
  mesh.position.set(x, y, z);
  mesh.rotation.x = Math.random() * 2 * Math.PI;
  mesh.rotation.y = Math.random() * 2 * Math.PI;
  const upperScale = 2.5;
  mesh.scale.set(0.1 + Math.random() * upperScale, 0.1 + Math.random() * upperScale, 0.1 + Math.random() * upperScale);
  const axisProbability = Math.random() * 3;
  const axis = axisProbability < 1 ? 'x' : axisProbability < 2 ? 'y' : 'z';
  const rate = Math.random() * 0.01 + 0.01;
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, fog: false });
  const line = new THREE.LineSegments(edges, lineMaterial);
  line.scale.setScalar(1.01)
  mesh.add(line);
  mesh.userData = {
    update () {
      mesh.rotation[axis] += rate;
    }
  }
  return mesh;
}
const numCube = 20;
const cubeGroup = new THREE.Group();
cubeGroup.userData.update = () => {
  cubeGroup.rotation.y += 0.01;
  cubeGroup.children.forEach((c) => {
    c.userData.update();
  })
}
scene.add(cubeGroup);
for (let i = 0; i < numCube; i++) {
  const cube = getBox();
  cubeGroup.add(cube);
}

function animate() {
  requestAnimationFrame(animate);
  cubeGroup.userData.update();
  controls.update();
  composer.render(scene, camera);
}
animate();
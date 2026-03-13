import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const mount = document.getElementById('viewer');
const status = document.getElementById('viewer-status');

try {
  if (!mount) {
    throw new Error('The CAD viewer mount point is missing.');
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7fff8);

  const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 5000);
  camera.position.set(170, 120, 170);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  scene.add(new THREE.AmbientLight(0xffffff, 1.7));

  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(130, 180, 100);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8ce2de, 0.8);
  fill.position.set(-120, 100, -120);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(165, 64),
    new THREE.MeshStandardMaterial({ color: 0xffe7ba, roughness: 0.95, metalness: 0.02 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -35;
  scene.add(floor);

  const loader = new STLLoader();
  loader.load(
    'full-assembly.stl',
    (geometry) => {
      geometry.computeVertexNormals();
      geometry.center();

      const material = new THREE.MeshStandardMaterial({
        color: 0x1b6f74,
        roughness: 0.46,
        metalness: 0.08,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fov = camera.fov * (Math.PI / 180);
      const distance = maxDim / (2 * Math.tan(fov / 2));
      camera.position.set(distance * 1.25, distance * 0.95, distance * 1.25);
      controls.target.set(0, 0, 0);
      controls.update();

      if (status) {
        status.textContent = 'STL loaded successfully.';
      }
    },
    undefined,
    (error) => {
      console.error(error);
      if (status) {
        status.textContent = 'The STL could not be loaded in the browser.';
      }
    }
  );

  function resize() {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', resize);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
} catch (error) {
  console.error(error);
  if (status) {
    status.textContent = error.message || 'The CAD viewer failed to initialize.';
  }
}

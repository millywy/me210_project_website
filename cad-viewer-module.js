import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Box3,
  Vector3,
  SRGBColorSpace,
  ACESFilmicToneMapping,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const mount = document.getElementById("viewer");
const status = document.getElementById("viewer-status");

try {
  if (!mount) {
    throw new Error("The CAD viewer mount point is missing.");
  }

  // Scene
  const scene = new Scene();
  scene.background = new Color(0xf7f7f3);

  // Camera
  const camera = new PerspectiveCamera(
    40,
    mount.clientWidth / mount.clientHeight,
    0.1,
    5000
  );
  camera.position.set(2, 1.5, 2);

  // Renderer
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  mount.appendChild(renderer.domElement);

  // Orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  // 3-point lighting
  // Ambient (fill)
  scene.add(new AmbientLight(0xffffff, 1.2));
  // Key light
  const keyLight = new DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);
  // Fill light
  const fillLight = new DirectionalLight(0xd0e8ff, 0.8);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);
  // Back/rim light
  const rimLight = new DirectionalLight(0xfff0d0, 0.5);
  rimLight.position.set(0, -3, -8);
  scene.add(rimLight);

  // Load GLB
  const loader = new GLTFLoader();
  loader.load(
    "assembly.glb",
    (gltf) => {
      const model = gltf.scene;

      // Ensure all materials use correct color space and rendering
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          const mats = Array.isArray(node.material)
            ? node.material
            : [node.material];
          mats.forEach((mat) => {
            if (mat) {
              mat.needsUpdate = true;
            }
          });
        }
      });

      scene.add(model);

      // Auto-center and fit camera to model
      const box = new Box3().setFromObject(model);
      if (box.isEmpty()) {
        if (status) status.textContent = "Model loaded (empty scene).";
        return;
      }
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;

      // Move model to be centered at origin
      model.position.sub(center);

      const fovRad = camera.fov * (Math.PI / 180);
      const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * 1.6;
      camera.position.set(distance * 0.8, distance * 0.5, distance * 0.8);
      camera.near = Math.max(0.01, distance * 0.001);
      camera.far = Math.min(100000, distance * 10);
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.update();

      if (status) {
        status.textContent = "assembly.glb loaded.";
      }
    },
    (xhr) => {
      if (status && xhr.total) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        status.textContent = `Loading… ${pct}%`;
      }
    },
    (error) => {
      console.error(error);
      if (status) {
        status.textContent = "The GLB could not be loaded.";
      }
    }
  );

  // Resize handler
  function resize() {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", resize);

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
} catch (error) {
  console.error(error);
  if (status) {
    status.textContent = error.message || "The CAD viewer failed to initialize.";
  }
}
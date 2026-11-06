// Demonstrasi 2: face tracking (MindAR + Three.js)
import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { setStatus, setupStartButton } from './common.js';

async function start() {
  const mindarThree = new MindARThree({
    container: document.getElementById('container'),
    uiLoading: 'no',
    uiScanning: 'no',
    uiError: 'no',
  });
  const { renderer, scene, camera } = mindarThree;

  const mask = mindarThree.addFaceMesh();
  mask.material.dispose();
  mask.material = new THREE.MeshStandardMaterial({
    color: 0xf97360,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.25,
    metalness: 0.12,
    roughness: 0.32,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.78,
  });
  scene.add(mask);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.4));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(0, 1, 2);
  scene.add(dir);

  await mindarThree.start(); // minta kamera depan, memuat model deteksi wajah
  setStatus('Mencari wajah', 'searching');

  let hadFace = false;
  renderer.setAnimationLoop(() => {
    const hasFace = mindarThree.getLatestEstimate() !== null;
    if (hasFace !== hadFace) {
      hadFace = hasFace;
      if (hasFace) {
        setStatus('Wajah terdeteksi - topeng aktif', 'found');
        document.getElementById('info').textContent = 'Efek topeng mengikuti wajah.';
      } else {
        setStatus('Wajah tidak terdeteksi - mencari wajah', 'searching');
        document.getElementById('info').textContent = 'Posisikan wajah di tengah kamera.';
      }
    }
    renderer.render(scene, camera);
  });
}

setupStartButton(start);
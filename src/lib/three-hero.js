import * as THREE from 'three';

export function initHeroScene(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.z = 8;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Icosahedron wireframe
  const icoGeom = new THREE.IcosahedronGeometry(1.6, 1);
  const edgesGeom = new THREE.EdgesGeometry(icoGeom);

  // Main wireframe (cyan)
  const mainLine = new THREE.LineSegments(
    edgesGeom,
    new THREE.LineBasicMaterial({ color: '#00d4ff', transparent: true, opacity: 0.6 })
  );
  scene.add(mainLine);

  // Slightly offset wireframe for RGB shift
  const shiftLine1 = new THREE.LineSegments(
    edgesGeom,
    new THREE.LineBasicMaterial({ color: '#a855f7', transparent: true, opacity: 0.25 })
  );
  shiftLine1.position.x = -0.03;
  shiftLine1.position.y = 0.03;
  scene.add(shiftLine1);

  const shiftLine2 = new THREE.LineSegments(
    edgesGeom,
    new THREE.LineBasicMaterial({ color: '#00d4ff', transparent: true, opacity: 0.2 })
  );
  shiftLine2.position.x = 0.03;
  shiftLine2.position.y = -0.02;
  scene.add(shiftLine2);

  // Inner dots at vertices
  const dotsGeom = new THREE.SphereGeometry(0.04, 8, 8);
  const dotsMaterial = new THREE.MeshBasicMaterial({ color: '#00d4ff' });
  const vertices = icoGeom.getAttribute('position').array;
  const dotsGroup = new THREE.Group();
  for (let i = 0; i < vertices.length; i += 3) {
    const dot = new THREE.Mesh(dotsGeom, dotsMaterial);
    dot.position.set(vertices[i] * 1.6, vertices[i + 1] * 1.6, vertices[i + 2] * 1.6);
    dotsGroup.add(dot);
  }
  scene.add(dotsGroup);

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    mouseX += (targetMouseX - mouseX) * 0.03;
    mouseY += (targetMouseY - mouseY) * 0.03;

    const rotSpeed = 0.3 + Math.abs(mouseX) * 2;
    mainLine.rotation.y += rotSpeed * 0.01;
    mainLine.rotation.x += mouseY * 0.015;
    shiftLine1.rotation.copy(mainLine.rotation);
    shiftLine2.rotation.copy(mainLine.rotation);
    dotsGroup.rotation.copy(mainLine.rotation);

    // Scale pulse
    const pulse = 1 + Math.sin(time * 1.5) * 0.03 + Math.abs(mouseX) * 0.06;
    mainLine.scale.setScalar(pulse);
    shiftLine1.scale.setScalar(pulse);
    shiftLine2.scale.setScalar(pulse);
    dotsGroup.scale.setScalar(pulse);

    renderer.render(scene, camera);
  }

  // Resize
  const resizeObs = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObs.observe(container);

  animate();
}

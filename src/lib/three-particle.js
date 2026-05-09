import * as THREE from 'three';

export function initParticleField(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  // Particle count
  const COUNT = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  // Store original positions for animation
  const origPositions = new Float32Array(COUNT * 3);

  const accentColor = new THREE.Color('#00d4ff');
  const purpleColor = new THREE.Color('#a855f7');
  const whiteColor = new THREE.Color('#ffffff');

  for (let i = 0; i < COUNT; i++) {
    // Spread particles in a large box, mostly in view
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 60;
    positions[i3 + 1] = (Math.random() - 0.5) * 40;
    positions[i3 + 2] = (Math.random() - 0.5) * 30;

    origPositions[i3] = positions[i3];
    origPositions[i3 + 1] = positions[i3 + 1];
    origPositions[i3 + 2] = positions[i3 + 2];

    // Color: mix between accent and purple, with some white
    const mix = Math.random();
    const color = accentColor.clone().lerp(purpleColor, mix);
    if (Math.random() < 0.1) color.lerp(whiteColor, 0.5);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 3 + 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Create circle sprite texture
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 32;
  spriteCanvas.height = 32;
  const ctx = spriteCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.15, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

  const material = new THREE.PointsMaterial({
    size: 0.15,
    map: spriteTexture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

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
    time += 0.005;

    // Smooth mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Update particle positions
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = origPositions[i3] + Math.sin(time + i * 0.01) * 0.5 + mouseX * 3;
      pos[i3 + 1] = origPositions[i3 + 1] + Math.cos(time + i * 0.015) * 0.5 + mouseY * 2;
      pos[i3 + 2] = origPositions[i3 + 2] + Math.sin(time * 0.7 + i * 0.02) * 0.3;
    }
    geometry.attributes.position.needsUpdate = true;

    // Slight rotation
    particles.rotation.y += 0.0002;
    particles.rotation.x += mouseY * 0.001;

    renderer.render(scene, camera);
  }

  // Handle resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  animate();
}

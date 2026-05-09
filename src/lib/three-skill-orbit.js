import * as THREE from 'three';

export function initSkillOrbit(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 12;

  // Skills data
  const skills = [
    { name: 'JavaScript', color: '#f7df1e' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'React', color: '#61dafb' },
    { name: 'Three.js', color: '#00d4ff' },
    { name: 'Node.js', color: '#83cd29' },
    { name: 'Python', color: '#a855f7' },
    { name: 'CSS', color: '#ff6b9d' },
    { name: 'Git', color: '#f05032' },
  ];

  // Create orbiting spheres
  const orbitRadius = 4;
  const spheres = [];

  skills.forEach((skill, i) => {
    const geom = new THREE.SphereGeometry(0.2, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: skill.color,
      emissive: skill.color,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.1,
    });
    const sphere = new THREE.Mesh(geom, mat);

    // Random start positions (scattered)
    sphere.userData = {
      name: skill.name,
      color: skill.color,
      targetAngle: (i / skills.length) * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      radius: orbitRadius + Math.random() * 2,
      height: (Math.random() - 0.5) * 3,
    };

    sphere.position.set(
      Math.random() * 8 - 4,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2
    );

    scene.add(sphere);
    spheres.push(sphere);
  });

  // Glow ring
  const ringGeom = new THREE.TorusGeometry(orbitRadius, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: '#00d4ff', transparent: true, opacity: 0.3 });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.visible = true;
  scene.add(ring);

  // Second ring (purple, tilted)
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(orbitRadius + 0.5, 0.015, 16, 80),
    new THREE.MeshBasicMaterial({ color: '#a855f7', transparent: true, opacity: 0.2 })
  );
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 4;
  scene.add(ring2);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0x00d4ff, 30, 20);
  pointLight.position.set(0, 2, 5);
  scene.add(pointLight);

  // Mouse hover detection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredSphere = null;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  let time = 0;
  let organized = false;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Smoothly move spheres toward their orbital positions
    spheres.forEach((sphere, i) => {
      const ud = sphere.userData;
      // Smooth transition to target angle
      ud.angle += (ud.targetAngle - ud.angle) * 0.03;
      // Move toward target radius and height
      ud.radius += (orbitRadius - ud.radius) * 0.03;
      ud.height += (0 - ud.height) * 0.03;

      const angle = ud.angle + time * 0.3;
      sphere.position.x = Math.cos(angle) * ud.radius;
      sphere.position.z = Math.sin(angle) * ud.radius;
      sphere.position.y = ud.height + Math.sin(time * 0.5 + i) * 0.3;
    });

    // Hover detection
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0 && hoveredSphere !== intersects[0].object) {
      if (hoveredSphere) {
        hoveredSphere.scale.setScalar(1);
        hoveredSphere.material.emissiveIntensity = 0.6;
      }
      hoveredSphere = intersects[0].object;
      hoveredSphere.scale.setScalar(1.8);
      hoveredSphere.material.emissiveIntensity = 1.2;
      // Show skill name (emit custom event or update DOM)
      const event = new CustomEvent('skill-hover', { detail: hoveredSphere.userData });
      canvas.dispatchEvent(event);
    } else if (intersects.length === 0 && hoveredSphere) {
      hoveredSphere.scale.setScalar(1);
      hoveredSphere.material.emissiveIntensity = 0.6;
      hoveredSphere = null;
      canvas.dispatchEvent(new CustomEvent('skill-hover', { detail: null }));
    }

    // Rotate rings
    ring.rotation.z += 0.002;
    ring2.rotation.z -= 0.0015;
    ring2.rotation.x += 0.001;

    // Camera sway
    camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 1 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // Resize
  const resizeObs = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObs.observe(canvas);

  animate();
}

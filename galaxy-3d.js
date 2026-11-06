
/* =========================================================
   Galaxy Digital Advertisers
   PROFESSIONAL SCROLL-DRIVEN 3D EARTH BACKGROUND
   Three.js r169
   ========================================================= */

(async function initGalaxyEarth() {
  "use strict";

  // -------------------------------------------------------
  // CONFIGURATION
  // -------------------------------------------------------

  const CONFIG = {
    desktopScale: 1,
    mobileScale: 0.68,

    desktopX: 2.0,
    mobileX: 0.9,

    maxPixelRatio: 1.25,

    globeRadius: 1.65,
    pointCount: 480,
    dustCount: 150,

    scrollSmoothness: 0.055,

    globeColor: 0x19d8f2,
    networkColor: 0x147da9,
    purpleColor: 0x9275ff,

    backgroundOpacity: 0.78
  };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const mobileQuery = window.matchMedia(
    "(max-width: 768px)"
  );

  // -------------------------------------------------------
  // LOAD THREE.JS SAFELY
  // -------------------------------------------------------

  let THREE;

  try {
    THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js"
    );
  } catch (error) {
    console.warn(
      "Galaxy Earth: Three.js could not be loaded.",
      error
    );
    return;
  }

  // -------------------------------------------------------
  // CREATE BACKGROUND HOST
  // -------------------------------------------------------

  if (document.getElementById("galaxy3d-background")) {
    return;
  }

  const host = document.createElement("div");

  host.id = "galaxy3d-background";
  host.setAttribute("aria-hidden", "true");

  document.body.prepend(host);

  // -------------------------------------------------------
  // WEBGL RENDERER
  // -------------------------------------------------------

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !mobileQuery.matches,
      powerPreference: "low-power",
      depth: true,
      stencil: false
    });
  } catch (error) {
    console.warn(
      "Galaxy Earth: WebGL is unavailable.",
      error
    );

    host.remove();
    return;
  }

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      CONFIG.maxPixelRatio
    )
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setClearColor(0x000000, 0);

  host.appendChild(renderer.domElement);

  // -------------------------------------------------------
  // SCENE AND CAMERA
  // -------------------------------------------------------

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 8.2);

  const universe = new THREE.Group();
  scene.add(universe);

  const globe = new THREE.Group();
  universe.add(globe);

  // -------------------------------------------------------
  // MAIN GLOBE WIREFRAME
  // -------------------------------------------------------

  const sphereGeometry = new THREE.SphereGeometry(
    CONFIG.globeRadius,
    40,
    32
  );

  const wireframeGeometry = new THREE.WireframeGeometry(
    sphereGeometry
  );

  const wireframe = new THREE.LineSegments(
    wireframeGeometry,
    new THREE.LineBasicMaterial({
      color: CONFIG.globeColor,
      transparent: true,
      opacity: 0.16,
      depthWrite: false
    })
  );

  globe.add(wireframe);

  // -------------------------------------------------------
  // GLOBE NETWORK POINTS
  // -------------------------------------------------------

  const pointPositions = [];

  const goldenAngle =
    Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < CONFIG.pointCount; i++) {
    const y =
      1 - (i / (CONFIG.pointCount - 1)) * 2;

    const radius = Math.sqrt(1 - y * y);

    const theta = goldenAngle * i;

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    pointPositions.push(
      x * (CONFIG.globeRadius + 0.018),
      y * (CONFIG.globeRadius + 0.018),
      z * (CONFIG.globeRadius + 0.018)
    );
  }

  const pointsGeometry = new THREE.BufferGeometry();

  pointsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      pointPositions,
      3
    )
  );

  const globePoints = new THREE.Points(
    pointsGeometry,
    new THREE.PointsMaterial({
      color: 0x43eaff,
      size: 0.021,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
      depthWrite: false
    })
  );

  globe.add(globePoints);

  // -------------------------------------------------------
  // NETWORK CONNECTIONS
  // -------------------------------------------------------

  const connectionPositions = [];

  for (
    let i = 0;
    i < CONFIG.pointCount;
    i += 2
  ) {
    const ax = pointPositions[i * 3];
    const ay = pointPositions[i * 3 + 1];
    const az = pointPositions[i * 3 + 2];

    let nearestIndex = -1;
    let nearestDistance = Infinity;

    const a = new THREE.Vector3(ax, ay, az);

    for (
      let j = i + 1;
      j < Math.min(i + 30, CONFIG.pointCount);
      j++
    ) {
      const b = new THREE.Vector3(
        pointPositions[j * 3],
        pointPositions[j * 3 + 1],
        pointPositions[j * 3 + 2]
      );

      const distance = a.distanceToSquared(b);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = j;
      }
    }

    if (nearestIndex !== -1) {
      connectionPositions.push(
        ax,
        ay,
        az,

        pointPositions[nearestIndex * 3],
        pointPositions[nearestIndex * 3 + 1],
        pointPositions[nearestIndex * 3 + 2]
      );
    }
  }

  const connectionsGeometry = new THREE.BufferGeometry();

  connectionsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      connectionPositions,
      3
    )
  );

  const connections = new THREE.LineSegments(
    connectionsGeometry,
    new THREE.LineBasicMaterial({
      color: CONFIG.networkColor,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    })
  );

  globe.add(connections);

  // -------------------------------------------------------
  // ORBITAL RINGS
  // -------------------------------------------------------

  const ringOne = new THREE.Mesh(
    new THREE.TorusGeometry(
      2.04,
      0.006,
      6,
      160
    ),
    new THREE.MeshBasicMaterial({
      color: CONFIG.globeColor,
      transparent: true,
      opacity: 0.30,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );

  ringOne.rotation.set(1.05, 0.2, 0.25);
  globe.add(ringOne);

  const ringTwo = new THREE.Mesh(
    new THREE.TorusGeometry(
      2.22,
      0.004,
      6,
      160
    ),
    new THREE.MeshBasicMaterial({
      color: CONFIG.purpleColor,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );

  ringTwo.rotation.set(0.45, 1.0, -0.4);
  globe.add(ringTwo);

  // -------------------------------------------------------
  // OUTER ATMOSPHERE RING
  // -------------------------------------------------------

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      1.72,
      32,
      24
    ),
    new THREE.MeshBasicMaterial({
      color: 0x087bdc,
      wireframe: true,
      transparent: true,
      opacity: 0.035,
      depthWrite: false
    })
  );

  globe.add(atmosphere);

  // -------------------------------------------------------
  // FLOATING SPACE PARTICLES
  // -------------------------------------------------------

  const dustPositions = [];

  for (let i = 0; i < CONFIG.dustCount; i++) {
    dustPositions.push(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 4
    );
  }

  const dustGeometry = new THREE.BufferGeometry();

  dustGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      dustPositions,
      3
    )
  );

  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0x38d9f2,
      size: 0.014,
      transparent: true,
      opacity: 0.52,
      sizeAttenuation: true,
      depthWrite: false
    })
  );

  scene.add(dust);

  // -------------------------------------------------------
  // RESPONSIVE POSITIONING
  // -------------------------------------------------------

  let baseScale = 1;
  let baseX = 2;

  function updateLayout() {
    const mobile = mobileQuery.matches;

    baseScale = mobile
      ? CONFIG.mobileScale
      : CONFIG.desktopScale;

    baseX = mobile
      ? CONFIG.mobileX
      : CONFIG.desktopX;

    camera.aspect =
      window.innerWidth / window.innerHeight;

    camera.position.z = mobile ? 9.3 : 8.2;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        CONFIG.maxPixelRatio
      )
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }

  updateLayout();

  window.addEventListener(
    "resize",
    updateLayout,
    { passive: true }
  );

  mobileQuery.addEventListener?.(
    "change",
    updateLayout
  );

  // -------------------------------------------------------
  // SCROLL PROGRESS
  // -------------------------------------------------------

  let targetScroll = 0;
  let currentScroll = 0;

  function readScroll() {
    const documentHeight =
      document.documentElement.scrollHeight;

    const maximumScroll =
      documentHeight - window.innerHeight;

    targetScroll = maximumScroll > 0
      ? THREE.MathUtils.clamp(
          window.scrollY / maximumScroll,
          0,
          1
        )
      : 0;
  }

  window.addEventListener(
    "scroll",
    readScroll,
    { passive: true }
  );

  readScroll();

  // -------------------------------------------------------
  // ANIMATION
  // -------------------------------------------------------

  const clock = new THREE.Clock();

  let animationFrame = null;
  let lastFrameTime = 0;

  const frameInterval = 1000 / 60;

  function animate(timestamp) {
    animationFrame = requestAnimationFrame(animate);

    if (document.hidden) {
      return;
    }

    // Limit unnecessary rendering on slower devices.
    if (
      timestamp - lastFrameTime < frameInterval
    ) {
      return;
    }

    lastFrameTime = timestamp;

    const elapsed = clock.getElapsedTime();

    if (!reducedMotion) {
      // Smooth scroll interpolation.
      currentScroll +=
        (targetScroll - currentScroll) *
        CONFIG.scrollSmoothness;

      const progress = currentScroll;

      // Globe movement across the website.
      universe.position.x =
        baseX -
        Math.sin(progress * Math.PI) * 2.15;

      universe.position.y =
        0.18 - progress * 1.05;

      // Subtle size change while scrolling.
      const scaleBoost =
        1 + Math.sin(progress * Math.PI) * 0.15;

      globe.scale.setScalar(
        baseScale * scaleBoost
      );

      // Natural globe rotation.
      globe.rotation.y =
        elapsed * 0.12 + progress * 2.3;

      globe.rotation.x =
        0.12 + Math.sin(elapsed * 0.18) * 0.08;

      // Orbital movement.
      ringOne.rotation.z += 0.0008;
      ringTwo.rotation.y += 0.0006;

      // Atmospheric movement.
      atmosphere.rotation.y =
        -elapsed * 0.035;

      // Floating particles.
      dust.rotation.y =
        elapsed * 0.012;

      dust.rotation.x =
        Math.sin(elapsed * 0.08) * 0.035;
    } else {
      globe.rotation.y = 0.45;
      globe.rotation.x = 0.12;
    }

    renderer.render(scene, camera);
  }

  // -------------------------------------------------------
  // TAB VISIBILITY
  // -------------------------------------------------------

  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) {
        clock.start();
        lastFrameTime = 0;
      }
    }
  );

  // -------------------------------------------------------
  // START
  // -------------------------------------------------------

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    animationFrame = requestAnimationFrame(animate);
  }

  console.info(
    "Galaxy Digital Advertisers: 3D Earth initialized."
  );

})();

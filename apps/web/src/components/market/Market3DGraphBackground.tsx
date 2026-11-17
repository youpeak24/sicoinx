import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Market3DGraphBackgroundProps {
  currentPrice?: string | number;
  priceDelta?: number;
}

export const Market3DGraphBackground: React.FC<Market3DGraphBackgroundProps> = ({
  currentPrice = '1.250000',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);

  // Mouse parallax state
  const mousePos = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 880;

    // 1. Scene & Camera Setup (Fixed Floor Perspective)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7faff, 0.013);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    // Initial floor perspective position
    camera.position.set(-12, 4.2, 25);
    const lookAtTarget = new THREE.Vector3(4, 5.2, 0);
    camera.lookAt(lookAtTarget);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.5);
    dirLight1.position.set(28, 45, 30);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x175cff, 2.0);
    dirLight2.position.set(-28, 30, -25);
    scene.add(dirLight2);

    // Dynamic photon point light that races along the spline
    const photonPointLight = new THREE.PointLight(0x00f5d4, 4.2, 40, 1.2);
    photonPointLight.position.set(0, 5, 0);
    scene.add(photonPointLight);

    // 4. Glow Particle Texture Helper
    const createGlowTexture = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 64;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.25, 'rgba(0, 240, 255, 0.85)');
        grad.addColorStop(0.65, 'rgba(23, 92, 255, 0.35)');
        grad.addColorStop(1, 'rgba(23, 92, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      const tex = new THREE.CanvasTexture(cvs);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };
    const glowTexture = createGlowTexture();

    // 5. Dynamic 3D Volatility Floor Terrain Grid
    const planeWidth = 98;
    const planeDepth = 75;
    const segmentsX = 64;
    const segmentsZ = 48;
    const terrainGeo = new THREE.PlaneGeometry(planeWidth, planeDepth, segmentsX, segmentsZ);
    terrainGeo.rotateX(-Math.PI / 2.3);
    terrainGeo.translate(0, -6.5, -5);

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x175cff,
      wireframe: true,
      transparent: true,
      opacity: 0.36,
      roughness: 0.15,
      metalness: 0.85,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);

    // Glowing constellation points at floor vertices
    const pointsMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.42,
      map: glowTexture,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const terrainPoints = new THREE.Points(terrainGeo, pointsMat);
    scene.add(terrainPoints);

    const originalPositions = terrainGeo.attributes.position.clone();

    // 6. Dynamic 3D Candlestick & Volume Towers
    const candlesGroup = new THREE.Group();
    scene.add(candlesGroup);

    interface CandleItem {
      boxMesh: THREE.Mesh;
      edgesMesh: THREE.LineSegments;
      wickMesh: THREE.Line;
      baseX: number;
      baseZ: number;
      baseY: number;
      currentHeight: number;
      targetHeight: number;
      speed: number;
      phase: number;
      isBullish: boolean;
    }

    const candles: CandleItem[] = [];
    const candleCount = 28;
    const boxBaseGeo = new THREE.BoxGeometry(1.3, 1, 1.3);
    const edgesBaseGeo = new THREE.EdgesGeometry(boxBaseGeo);

    // Bullish emerald & cyan glass
    const bullishMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.82,
      roughness: 0.2,
      metalness: 0.7,
    });
    const bullishEdgeMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      linewidth: 2,
      transparent: true,
      opacity: 0.95,
    });

    // Institutional sapphire & royal blue glass
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x175cff,
      emissive: 0x0066cc,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.78,
      roughness: 0.2,
      metalness: 0.7,
    });
    const blueEdgeMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < candleCount; i++) {
      const isBull = Math.random() > 0.35;
      const mat = isBull ? bullishMat : blueMat;
      const edgeMat = isBull ? bullishEdgeMat : blueEdgeMat;

      const boxMesh = new THREE.Mesh(boxBaseGeo, mat);
      const edgesMesh = new THREE.LineSegments(edgesBaseGeo, edgeMat);

      const wickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -2.0, 0),
        new THREE.Vector3(0, 2.0, 0),
      ]);
      const wickLine = new THREE.Line(
        wickGeo,
        new THREE.LineBasicMaterial({ color: isBull ? 0x6ee7b7 : 0x93c5fd, transparent: true, opacity: 0.75 })
      );

      const row = Math.floor(i / 7);
      const col = i % 7;
      const baseX = (col - 3) * 8.8 + (Math.random() - 0.5) * 2;
      const baseZ = (row - 2) * 9.8 + (Math.random() - 0.5) * 2;
      const baseY = -5.0;
      const initialHeight = 2.8 + Math.random() * 5.8;

      boxMesh.position.set(baseX, baseY + initialHeight / 2, baseZ);
      boxMesh.scale.set(1, initialHeight, 1);

      edgesMesh.position.copy(boxMesh.position);
      edgesMesh.scale.copy(boxMesh.scale);

      wickLine.position.set(baseX, baseY + initialHeight / 2, baseZ);
      wickLine.scale.set(1, initialHeight * 0.75, 1);

      candlesGroup.add(boxMesh);
      candlesGroup.add(edgesMesh);
      candlesGroup.add(wickLine);

      candles.push({
        boxMesh,
        edgesMesh,
        wickMesh: wickLine,
        baseX,
        baseZ,
        baseY,
        currentHeight: initialHeight,
        targetHeight: initialHeight,
        speed: 0.04 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        isBullish: isBull,
      });
    }

    // 7. Hero 3D Price Trajectory Spline & MA Ribbon
    const curvePoints = [
      new THREE.Vector3(-38, -3.5, -14),
      new THREE.Vector3(-30, -1.8, -10),
      new THREE.Vector3(-22, 2.0, -5),
      new THREE.Vector3(-14, 0.5, 0),
      new THREE.Vector3(-5, 4.8, 4),
      new THREE.Vector3(4, 3.5, 7),
      new THREE.Vector3(12, 7.6, 9),
      new THREE.Vector3(20, 6.0, 11),
      new THREE.Vector3(28, 10.2, 13),
      new THREE.Vector3(35, 12.2, 15),
    ];
    const priceCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(priceCurve, 140, 0.28, 14, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d2f0,
      emissiveIntensity: 1.6,
      roughness: 0.1,
      metalness: 0.9,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    // Secondary Moving Average Curve
    const secondaryPoints = curvePoints.map((p) => new THREE.Vector3(p.x, p.y - 2.8, p.z - 2.4));
    const secondaryCurve = new THREE.CatmullRomCurve3(secondaryPoints);
    const secondaryTubeGeo = new THREE.TubeGeometry(secondaryCurve, 120, 0.15, 10, false);
    const secondaryTubeMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x7c3aed,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.75,
      roughness: 0.25,
      metalness: 0.65,
    });
    const secondaryTubeMesh = new THREE.Mesh(secondaryTubeGeo, secondaryTubeMat);
    scene.add(secondaryTubeMesh);

    // 8. Traveling Energy Photons (Simulated Live Trades)
    const photonCount = 3;
    const photons: { mesh: THREE.Mesh; speed: number; offset: number }[] = [];
    const photonGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < photonCount; i++) {
      const pMesh = new THREE.Mesh(photonGeo, photonMat);
      const auraGeo = new THREE.SphereGeometry(0.95, 12, 12);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0x00f5d4,
        transparent: true,
        opacity: 0.6,
      });
      pMesh.add(new THREE.Mesh(auraGeo, auraMat));

      scene.add(pMesh);
      photons.push({
        mesh: pMesh,
        speed: 0.11 + i * 0.04,
        offset: i / photonCount,
      });
    }

    // 9. Concentric Radar Rings at Current Live Price Apex
    const apexPoint = curvePoints[curvePoints.length - 1];
    const radarGroup = new THREE.Group();
    radarGroup.position.copy(apexPoint);
    scene.add(radarGroup);

    const beaconGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });
    const beaconSphere = new THREE.Mesh(beaconGeo, beaconMat);
    radarGroup.add(beaconSphere);

    const ringCount = 3;
    const radarRings: { mesh: THREE.Mesh; scale: number; speed: number }[] = [];
    for (let i = 0; i < ringCount; i++) {
      const rGeo = new THREE.RingGeometry(0.9, 1.2, 32);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x00f5d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(rGeo, rMat);
      ringMesh.rotation.x = Math.PI / 2;
      radarGroup.add(ringMesh);
      radarRings.push({
        mesh: ringMesh,
        scale: 1 + i * 1.3,
        speed: 0.02 + i * 0.006,
      });
    }

    // 10. Stardust Particles Field
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 85;
      particlePositions[i * 3 + 1] = Math.random() * 34 - 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 65;
      particleSpeeds.push(0.016 + Math.random() * 0.038);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.46,
      map: glowTexture,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 11. Mouse Movement for Smooth Parallax Depth
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current.targetX = normX;
      mousePos.current.targetY = normY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 12. Responsive Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // 13. Fixed Floor Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const simTime = elapsed * 1.0;

      // A. Undulate Floor Terrain Mesh
      const posAttr = terrainGeo.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const ox = originalPositions.getX(i);
        const oy = originalPositions.getY(i);

        const wave1 = Math.sin(ox * 0.16 + simTime * 1.5) * Math.cos(oy * 0.18 + simTime * 1.1) * 1.6;
        const wave2 = Math.sin((ox + oy) * 0.11 + simTime * 1.8) * 0.9;
        const wave3 = Math.cos(Math.hypot(ox, oy) * 0.18 - simTime * 1.3) * 0.7;

        posAttr.setZ(i, originalPositions.getZ(i) + wave1 + wave2 + wave3);
      }
      posAttr.needsUpdate = true;

      // B. Animate Candlestick Towers on the Floor
      candles.forEach((c) => {
        const target =
          c.baseY + 4.2 + Math.sin(simTime * 1.2 + c.phase) * 2.8 + (c.isBullish ? 1.5 : 0);
        c.currentHeight += (target - c.currentHeight) * c.speed;

        c.boxMesh.scale.y = Math.max(0.6, c.currentHeight);
        c.boxMesh.position.y = c.baseY + c.currentHeight / 2;

        c.edgesMesh.scale.y = c.boxMesh.scale.y;
        c.edgesMesh.position.y = c.boxMesh.position.y;

        c.wickMesh.position.y = c.boxMesh.position.y;
        c.wickMesh.scale.y = c.boxMesh.scale.y * 0.75;
      });

      // C. Animate Traveling Photons along Spline
      photons.forEach((p, idx) => {
        const t = (elapsed * p.speed + p.offset) % 1;
        const pt = priceCurve.getPointAt(t);
        p.mesh.position.copy(pt);

        if (idx === 0) {
          photonPointLight.position.copy(pt);
        }
      });

      // D. Animate Beacon and Concentric Radar Rings
      const beaconPulse = 1 + Math.sin(simTime * 4) * 0.18;
      beaconSphere.scale.set(beaconPulse, beaconPulse, beaconPulse);

      radarRings.forEach((r) => {
        r.scale += r.speed;
        if (r.scale > 4.8) {
          r.scale = 1.0;
        }
        r.mesh.scale.set(r.scale, r.scale, r.scale);
        const mat = r.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.85 * (1 - (r.scale - 1) / 3.8));
      });

      // E. Animate Stardust Particles
      const partPos = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let py = partPos.getY(i);
        py += particleSpeeds[i];
        if (py > 28) {
          py = -8;
        }
        partPos.setY(i, py);
      }
      partPos.needsUpdate = true;

      // F. Smooth Mouse Parallax Lerping (Fixed Floor Perspective)
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.04;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.04;

      const destX = -12 + mousePos.current.x * 4.5;
      const destY = 4.2 + mousePos.current.y * 2.5;
      const destZ = 25;

      camera.position.x += (destX - camera.position.x) * 0.04;
      camera.position.y += (destY - camera.position.y) * 0.04;
      camera.position.z += (destZ - camera.position.z) * 0.04;
      camera.lookAt(lookAtTarget);

      renderer.render(scene, camera);
    };

    animate();

    // 14. Resource Cleanup on Unmount
    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);

      terrainGeo.dispose();
      terrainMat.dispose();
      pointsMat.dispose();
      boxBaseGeo.dispose();
      edgesBaseGeo.dispose();
      bullishMat.dispose();
      bullishEdgeMat.dispose();
      blueMat.dispose();
      blueEdgeMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      secondaryTubeGeo.dispose();
      secondaryTubeMat.dispose();
      photonGeo.dispose();
      photonMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      glowTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 inset-x-0 h-[920px] sm:h-[980px] z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* 3D WebGL Floor Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />

      {/* Ambient Gradient Overlays for Seamless Page Flow */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#F7FAFF] via-[#F7FAFF]/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-[#F7FAFF] via-[#F7FAFF]/85 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F7FAFF] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#F7FAFF] to-transparent pointer-events-none" />
    </div>
  );
};

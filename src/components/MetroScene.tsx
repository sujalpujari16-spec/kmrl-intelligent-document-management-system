import React, { useMemo, useRef, Suspense, Component, ReactNode, ErrorInfo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Group, Mesh } from "three";

const BRAND_TEAL = "#4aa8b8";
const BRAND_TEAL_LIGHT = "#7cc7d4";
const BODY_SILVER = "#c3ccd6";
const WINDOW_GLOW = "#ffe9b8";
const TRACK_GREY = "#2a3340";
const PILLAR_GREY = "#232b36";

/* A single metro car with glowing windows */
function MetroCar({ z, isHead = false }: { z: number; isHead?: boolean }) {
  return (
    <group position={[0, 0, z]}>
      {/* Main body */}
      <RoundedBox args={[1.5, 1.3, 3]} radius={0.35} smoothness={6} castShadow>
        <meshStandardMaterial color={BODY_SILVER} metalness={0.85} roughness={0.25} />
      </RoundedBox>

      {/* Roof accent */}
      <RoundedBox args={[1.3, 0.25, 2.9]} radius={0.12} smoothness={4} position={[0, 0.62, 0]}>
        <meshStandardMaterial color="#aab3be" metalness={0.9} roughness={0.3} />
      </RoundedBox>

      {/* Glowing window bands - both sides */}
      {[0.77, -0.77].map((x) => (
        <mesh key={x} position={[x, 0.18, 0]}>
          <boxGeometry args={[0.05, 0.52, 2.6]} />
          <meshStandardMaterial
            color={WINDOW_GLOW}
            emissive={WINDOW_GLOW}
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Teal skirt stripe */}
      {[0.78, -0.78].map((x) => (
        <mesh key={x} position={[x, -0.45, 0]}>
          <boxGeometry args={[0.05, 0.3, 2.9]} />
          <meshStandardMaterial
            color={BRAND_TEAL}
            emissive={BRAND_TEAL}
            emissiveIntensity={0.6}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Head cabin */}
      {isHead && (
        <group position={[0, 0, 1.5]}>
          <RoundedBox args={[1.5, 1.3, 0.9]} radius={0.42} smoothness={6} position={[0, 0, 0.35]} castShadow>
            <meshStandardMaterial color={BRAND_TEAL_LIGHT} metalness={0.7} roughness={0.2} />
          </RoundedBox>
          {/* Windshield */}
          <mesh position={[0, 0.28, 0.72]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[1.15, 0.55, 0.05]} />
            <meshStandardMaterial
              color={WINDOW_GLOW}
              emissive={WINDOW_GLOW}
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
          {/* Headlights */}
          {[0.42, -0.42].map((x) => (
            <mesh key={x} position={[x, -0.32, 0.8]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#eaf6ff" emissiveIntensity={4} toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/* The full train that loops toward the camera */
function Train() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.z += delta * 7;
    if (ref.current.position.z > 24) ref.current.position.z = -32;
  });
  return (
    <group ref={ref} position={[0, 0.35, -32]}>
      <MetroCar z={0} isHead />
      <MetroCar z={-3.15} />
      <MetroCar z={-6.3} />
      <MetroCar z={-9.45} />
    </group>
  );
}

/* Elevated viaduct beam + pillars, reflective wet deck */
function Viaduct() {
  const pillars = useMemo(() => Array.from({ length: 14 }, (_, i) => -40 + i * 6), []);
  return (
    <group position={[0, -1.1, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[2.6, 0.5, 100]} />
        <meshStandardMaterial color={TRACK_GREY} metalness={0.6} roughness={0.35} />
      </mesh>
      {[0.5, -0.5].map((x) => (
        <mesh key={x} position={[x, 0.28, 0]}>
          <boxGeometry args={[0.12, 0.1, 100]} />
          <meshStandardMaterial color="#6d7580" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
      {pillars.map((z, i) => (
        <mesh key={i} position={[0, -2.2, z]} castShadow>
          <cylinderGeometry args={[0.55, 0.7, 4, 12]} />
          <meshStandardMaterial color={PILLAR_GREY} metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* Distant city skyline of glowing towers */
function CitySkyline() {
  const towers = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 34 }, () => ({
      x: rng(-30, 30),
      z: rng(-46, -20),
      h: rng(3, 11),
      w: rng(1.2, 2.6),
      glow: Math.random() > 0.4,
    }));
  }, []);
  return (
    <group position={[0, -3.3, 0]}>
      {towers.map((t, i) => (
        <mesh key={i} position={[t.x, t.h / 2, t.z]}>
          <boxGeometry args={[t.w, t.h, t.w]} />
          <meshStandardMaterial
            color="#141b26"
            emissive={t.glow ? "#3d5a80" : "#0c1119"}
            emissiveIntensity={t.glow ? 0.5 : 0}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

/* Warm speed streaks whipping past to sell motion */
function SpeedStreaks() {
  const ref = useRef<Group>(null);
  const streaks = useMemo(() => {
    const rng = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 26 }, () => ({
      x: rng(-9, 9),
      y: rng(-1.5, 5),
      z: rng(-30, 20),
      len: rng(1.5, 4),
    }));
  }, []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.children.forEach((c) => {
      c.position.z += delta * 26;
      if (c.position.z > 22) c.position.z = -30;
    });
  });
  return (
    <group ref={ref}>
      {streaks.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <boxGeometry args={[0.03, 0.03, s.len]} />
          <meshStandardMaterial color={BRAND_TEAL_LIGHT} emissive={BRAND_TEAL_LIGHT} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* Cinematic camera drift */
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.12) * 2 + 6.5;
    state.camera.position.y = 3 + Math.sin(t * 0.18) * 0.4;
    state.camera.lookAt(0, 0.2, 3);
  });
  return null;
}

/* Gradient dusk sky */
function DuskSky() {
  const ref = useRef<Mesh>(null);
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        top: { value: new THREE.Color("#0b1a2b") },
        mid: { value: new THREE.Color("#1d3a5f") },
        bottom: { value: new THREE.Color("#e0805a") },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
        void main() {
          float h = normalize(vPos).y;
          vec3 col = mix(bottom, mid, smoothstep(-0.1, 0.35, h));
          col = mix(col, top, smoothstep(0.3, 0.9, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, []);
  return (
    <mesh ref={ref} scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* Safe Error Boundary */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("3D WebGL fallback activated:", error, info);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function MetroSceneContent() {
  return (
    <>
      <DuskSky />
      <fog attach="fog" args={["#1d3a5f", 24, 62]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 12, 4]} intensity={1.2} color="#ffd9a0" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 2, 6]} intensity={25} color={BRAND_TEAL_LIGHT} distance={20} />
      <hemisphereLight groundColor="#0b1a2b" color="#7cc7d4" intensity={0.5} />

      <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={1} />
      <CitySkyline />
      <SpeedStreaks />

      <Float speed={1} rotationIntensity={0} floatIntensity={0.12}>
        <Train />
      </Float>
      <Viaduct />

      <EffectComposer>
        <Bloom intensity={1.1} luminanceThreshold={0.55} luminanceSmoothing={0.9} mipmapBlur radius={0.8} />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>

      <CameraRig />
    </>
  );
}

export function MetroScene() {
  const fallback = (
    <div className="absolute inset-0 bg-gradient-to-b from-[#0b1a2b] via-[#1d3a5f] to-[#e0805a] flex items-center justify-center overflow-hidden">
      <div className="text-center text-teal-300 font-semibold tracking-widest text-xs uppercase animate-pulse">
        Kochi Metro Rail 3D
      </div>
    </div>
  );

  return (
    <ThreeErrorBoundary fallback={fallback}>
      <Canvas
        shadows
        camera={{ position: [6.5, 3, 13], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <MetroSceneContent />
        </Suspense>
      </Canvas>
    </ThreeErrorBoundary>
  );
}

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// ─── Geometric Lamborghini-Style EV ───────────────────────────────────────────
function GeometricLambo() {
  const groupRef = useRef();
  const wheels = [useRef(), useRef(), useRef(), useRef()];
  const { clock } = useThree();

  useFrame(() => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Hover/breathing
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
      groupRef.current.rotation.y += 0.003;
    }
    // Spin wheels
    wheels.forEach(w => {
      if (w.current) w.current.rotation.x += 0.08;
    });
  });

  // Lamborghini Yellow (Giallo Orion)
  const bodyPaint = useMemo(() => new THREE.MeshStandardMaterial({ color: "#EAB308", metalness: 0.6, roughness: 0.2 }), []);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111111", metalness: 0.8, roughness: 0.4 }), []);
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000000", metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.9 }), []);
  const rimMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#050505", metalness: 0.9, roughness: 0.2 }), []);
  const tireMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000000", metalness: 0.1, roughness: 0.9 }), []);
  
  const drlMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FFFFFF", emissive: "#FFFFFF", emissiveIntensity: 3.0 }), []);
  const tailMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FF0000", emissive: "#FF2222", emissiveIntensity: 4.0 }), []);

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* ── Core Low Chassis ── */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow material={bodyPaint}>
        <boxGeometry args={[4.2, 0.4, 1.85]} />
      </mesh>

      {/* ── Wedge Engine Cover / Roof ── */}
      <mesh position={[-0.8, 0.55, 0]} rotation={[0, 0, 0.15]} material={accentMat} castShadow>
        <boxGeometry args={[1.5, 0.15, 1.5]} />
      </mesh>

      {/* ── Sloping Windshield ── */}
      <mesh position={[0.4, 0.55, 0]} rotation={[0, 0, -0.45]} material={glassMat} castShadow>
        <boxGeometry args={[1.6, 0.4, 1.6]} />
      </mesh>

      {/* ── Flat Roof ── */}
      <mesh position={[-0.45, 0.7, 0]} material={bodyPaint} castShadow>
        <boxGeometry args={[0.9, 0.05, 1.4]} />
      </mesh>

      {/* ── Pointy Front Wedge ── */}
      <mesh position={[1.8, 0.35, 0]} rotation={[0, 0, 0.3]} material={bodyPaint} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.2, 1.7]} />
      </mesh>
      
      {/* ── Front Aggressive Splitter (Black) ── */}
      <mesh position={[2.2, 0.05, 0]} rotation={[0, 0, -0.1]} material={accentMat} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.15, 1.8]} />
      </mesh>

      {/* ── Side Windows ── */}
      <mesh position={[-0.1, 0.52, 0.81]} rotation={[0, 0, -0.1]} material={glassMat}>
        <boxGeometry args={[1.6, 0.3, 0.05]} />
      </mesh>
      <mesh position={[-0.1, 0.52, -0.81]} rotation={[0, 0, -0.1]} material={glassMat}>
        <boxGeometry args={[1.6, 0.3, 0.05]} />
      </mesh>

      {/* ── Massive Side Intakes (Black) ── */}
      <mesh position={[-0.6, 0.2, 0.95]} rotation={[0, 0.2, 0]} material={accentMat}>
        <boxGeometry args={[1.2, 0.3, 0.15]} />
      </mesh>
      <mesh position={[-0.6, 0.2, -0.95]} rotation={[0, -0.2, 0]} material={accentMat}>
        <boxGeometry args={[1.2, 0.3, 0.15]} />
      </mesh>

      {/* ── Rear Deck ── */}
      <mesh position={[-1.7, 0.3, 0]} material={bodyPaint}>
        <boxGeometry args={[1.0, 0.2, 1.85]} />
      </mesh>
      
      {/* ── Rear Diffuser ── */}
      <mesh position={[-2.1, 0.1, 0]} rotation={[0, 0, 0.15]} material={accentMat} castShadow>
        <boxGeometry args={[0.5, 0.25, 1.9]} />
      </mesh>

      {/* ── Y-Shaped Headlights (Aggressive layout) ── */}
      <group position={[2.4, 0.3, 0.75]} rotation={[0, 0.2, 0.2]}>
        <mesh material={drlMat}><boxGeometry args={[0.02, 0.02, 0.4]} /></mesh>
        <mesh position={[-0.15, 0.08, -0.15]} rotation={[0, 0, 0.6]} material={drlMat}><boxGeometry args={[0.2, 0.02, 0.02]} /></mesh>
      </group>
      <group position={[2.4, 0.3, -0.75]} rotation={[0, -0.2, -0.2]}>
        <mesh material={drlMat}><boxGeometry args={[0.02, 0.02, 0.4]} /></mesh>
        <mesh position={[-0.15, 0.08, 0.15]} rotation={[0, 0, -0.6]} material={drlMat}><boxGeometry args={[0.2, 0.02, 0.02]} /></mesh>
      </group>

      {/* ── Aggressive Arrow Tail Lights ── */}
      <group position={[-2.15, 0.38, 0.75]} rotation={[0, 0, -0.1]}>
        <mesh material={tailMat}><boxGeometry args={[0.02, 0.02, 0.5]} /></mesh>
        <mesh position={[0.08, 0.08, 0]} rotation={[0.6, 0, 0]} material={tailMat}><boxGeometry args={[0.02, 0.15, 0.02]} /></mesh>
      </group>
      <group position={[-2.15, 0.38, -0.75]} rotation={[0, 0, -0.1]}>
        <mesh material={tailMat}><boxGeometry args={[0.02, 0.02, 0.5]} /></mesh>
        <mesh position={[0.08, 0.08, 0]} rotation={[-0.6, 0, 0]} material={tailMat}><boxGeometry args={[0.02, 0.15, 0.02]} /></mesh>
      </group>

      {/* ── Massive Staggered Wheels ── */}
      {[
        [1.5, 0.1, 0.98],   // front left
        [1.5, 0.1, -0.98],  // front right
        [-1.3, 0.1, 1.05],  // rear left
        [-1.3, 0.1, -1.05], // rear right
      ].map((pos, i) => {
        const isRear = i >= 2;
        const radius = isRear ? 0.45 : 0.40; // Massive wheels
        const width = isRear ? 0.35 : 0.28;
        return (
          <group key={i} position={pos}>
            <mesh ref={wheels[i]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              {/* Tire */}
              <cylinderGeometry args={[radius, radius, width, 48]} />
              <primitive object={tireMat} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              {/* Rim inner structure */}
              <cylinderGeometry args={[radius - 0.1, radius - 0.1, width + 0.02, 12]} />
              <primitive object={rimMat} />
            </mesh>
            {/* Glowing Brake Calipers for high-end look */}
            <mesh position={[0, isRear ? 0.18 : 0.15, 0.05]}>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={2.0} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Exported canvas ───────────────────────────────────────────────────────────
export default function Car3D() {
  return (
    <Canvas
      // Zoomed camera so the car appears huge
      camera={{ position: [7, 3, 7], fov: 40 }}
      shadows
      gl={{ 
        antialias: false, 
        alpha: true, 
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping, 
        shadowMap: { type: THREE.PCFShadowMap } 
      }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {/* ── Premium Studio Lighting ── */}
      <ambientLight intensity={0.5} color="#FFFFFF" />

      {/* Main Overhead Hero Light */}
      <rectAreaLight
        width={10} height={10}
        color="#FFFFFF"
        intensity={3}
        position={[0, 6, 0]}
        lookAt={[0, 0, 0]}
      />

      {/* Dynamic Cinematic Spotlights */}
      <spotLight
        position={[-8, 6, -6]}
        angle={0.5}
        penumbra={0.5}
        intensity={150}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      <pointLight position={[4, 2, 4]} intensity={20} color="#FACC15" distance={15} />

      {/* ── The Geometric Lambo ── */}
      <Suspense fallback={null}>
        <GeometricLambo />
        {/* Soft realistic baked shadow */}
        <ContactShadows
          resolution={512}
          scale={15}
          blur={2}
          opacity={0.8}
          far={3}
          color="#000000"
          position={[0, -0.32, 0]}
        />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}

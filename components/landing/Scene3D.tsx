"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const VIOLET = "#8b5cf6";
const BLUE = "#3b82f6";
const CYAN = "#22d3ee";

function DocumentSheet({
  position,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <group position={position} rotation={rotation} scale={scale}>
        <RoundedBox args={[1.1, 1.45, 0.03]} radius={0.05}>
          <meshStandardMaterial
            color="#1e1b3a"
            metalness={0.3}
            roughness={0.35}
            emissive={VIOLET}
            emissiveIntensity={0.08}
          />
        </RoundedBox>
        {/* text lines on the sheet */}
        {[0.45, 0.28, 0.11, -0.06, -0.23, -0.4].map((y, i) => (
          <mesh key={i} position={[i % 3 === 2 ? -0.12 : 0, y, 0.02]}>
            <boxGeometry args={[i % 3 === 2 ? 0.55 : 0.8, 0.045, 0.005]} />
            <meshStandardMaterial
              color={i === 0 ? CYAN : "#4c4880"}
              emissive={i === 0 ? CYAN : BLUE}
              emissiveIntensity={i === 0 ? 0.6 : 0.15}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function AICore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const pulse = 1 + Math.sin(t * 1.6) * 0.05;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
      ringRef.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.65, 4]} />
        <meshStandardMaterial
          color={VIOLET}
          emissive={VIOLET}
          emissiveIntensity={1.8}
          metalness={0.2}
          roughness={0.25}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.05, 0.015, 16, 80]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.2} />
      </mesh>
      <pointLight color={VIOLET} intensity={6} distance={8} />
    </group>
  );
}

const PARTICLE_COUNT = 500;

function ParticleStream() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 2 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.15 + Math.random() * 0.45;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + y * y + z * z);
      if (dist < 0.8) {
        // respawn on outer shell
        const r = 4.5 + Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos.setXYZ(
          i,
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
      } else {
        const pull = (speeds[i] * delta) / dist;
        pos.setXYZ(i, x - x * pull, y - y * pull, z - z * pull);
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={CYAN}
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function SceneContents() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    // subtle mouse parallax
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.25,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.15,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      <AICore />
      <ParticleStream />
      <DocumentSheet position={[-2.6, 0.8, -0.5]} rotation={[0.1, 0.5, -0.08]} scale={0.9} />
      <DocumentSheet position={[2.5, 1.2, -1]} rotation={[-0.1, -0.45, 0.1]} scale={0.75} />
      <DocumentSheet position={[-2.1, -1.4, -1.2]} rotation={[0.2, 0.35, 0.12]} scale={0.7} />
      <DocumentSheet position={[2.3, -1, -0.3]} rotation={[-0.15, -0.55, -0.1]} scale={0.85} />
      <DocumentSheet position={[0.2, 2.1, -2]} rotation={[0.3, 0.1, 0.05]} scale={0.6} />
      <Sparkles count={60} scale={9} size={1.6} speed={0.25} color={VIOLET} opacity={0.5} />
    </group>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color={BLUE} />
      <SceneContents />
    </Canvas>
  );
}

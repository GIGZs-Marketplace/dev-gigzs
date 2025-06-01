import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

type BoxProps = {
  isHovered: boolean;
  pointer: { x: number; y: number } | null;
};

function Box({ isHovered, pointer }: BoxProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  const [savedRotation, setSavedRotation] = useState<{x:number, y:number} | null>(null);

  useFrame((state, delta) => {
    if (isHovered && pointer && meshRef.current) {
      // Convert pointer.x/y (-1..1) to world position at z=0
      const vec = new THREE.Vector3(pointer.x, pointer.y, 0.5).unproject(camera);
      meshRef.current.lookAt(vec);
      // Save the current rotation for resuming normal rotation
      if (!savedRotation) {
        setSavedRotation({
          x: meshRef.current.rotation.x,
          y: meshRef.current.rotation.y,
        });
      }
    } else if (meshRef.current) {
      // Resume normal rotation
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.3;
      if (savedRotation) setSavedRotation(null);
    }
  });

  return (
    <mesh ref={meshRef} scale={2.5}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00704a" transparent opacity={0.8} />
    </mesh>
  );
}


export default function ThreeBackground() {
  const [isHovered, setIsHovered] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  // Map pointer event to normalized device coordinates (-1 to 1)
  const handlePointerMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setPointer({ x, y });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.6 }}>
      <Canvas
        onPointerMove={isHovered ? handlePointerMove : undefined}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => { setIsHovered(false); setPointer(null); }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Box isHovered={isHovered} pointer={pointer} />
      </Canvas>
    </div>
  );
}
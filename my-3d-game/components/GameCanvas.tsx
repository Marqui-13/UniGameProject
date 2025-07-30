import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import axios from 'axios';

const Collectible = ({ position, onCollect }: { position: [number, number, number]; onCollect: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} onClick={onCollect}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const Scene = ({ onScore }: { onScore: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    void main() {
      float glow = sin(length(vPosition) * 2.0 + time) * 0.5 + 0.5;
      gl_FragColor = vec4(0.2, 0.5, glow, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0.0 },
    },
  });

  useEffect(() => {
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
        (meshRef.current.material as THREE.ShaderMaterial).uniforms.time.value += 0.05;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <>
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <primitive object={material} />
      </mesh>
      <Collectible position={[2, 0, 0]} onCollect={onScore} />
      <Collectible position={[-2, 0, 0]} onCollect={onScore} />
    </>
  );
};

export default function GameCanvas({ setScore }: { setScore: (score: number) => void }) {
  // You need to keep track of the score outside this function
  // For demonstration, let's assume you pass the current score as a prop
  // and increment it here. You may need to lift state up to a parent.
  // If setScore is just (score: number) => void, you need to get the current score from props or state
  // For now, let's assume you have a currentScore prop:
  // const newScore = currentScore + 1;
  // setScore(newScore);

  // To fix the error, you need to pass the incremented score directly.
  // For example, if you have a currentScore prop:
  // setScore(currentScore + 1);

  // If you don't have currentScore, you need to lift the score state up to a parent component.

  const handleCollect = async () => {
    // Replace this with your actual score logic
    // Example: setScore(currentScore + 1);
    // If you don't have currentScore, lift the score state up to a parent component.
  };

  return (
    <Canvas style={{ height: '100vh' }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 0, 5]} />
      <Scene onScore={handleCollect} />
      <OrbitControls />
    </Canvas>
  );
}
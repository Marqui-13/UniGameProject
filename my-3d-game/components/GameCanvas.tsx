import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import axios from 'axios';
import * as THREE from 'three';
import { useRouter } from 'next/router';
import useGameStore from '../lib/store';
// Use the public path as a string for the GLB model
const spaceship = '/models/spaceship.glb';

const getRandomLane = () => {
  const lanes = [-2, 0, 2]; // Three lanes at x = -2, 0, 2
  return lanes[Math.floor(Math.random() * lanes.length)];
};

function Scene() {
  const {
    level,
    isGameStarted,
    lane,
    gameOver,
    obstacles,
    setTime,
    setGameOver,
    addObstacle,
    updateObstacles,
    moveLane,
  } = useGameStore();
  const spaceshipRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(spaceship);
  const obstacleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const { camera, gl } = useThree();
  const router = useRouter();
  const startTimeRef = useRef(0);

  // Level settings
  const levelSettings = {
    easy: { speed: 0.05, spawnInterval: 2000 },
    medium: { speed: 0.08, spawnInterval: 1500 },
    hard: { speed: 0.12, spawnInterval: 1000 },
  };

  // Hover and tilt effect for spaceship
  useFrame((state) => {
    if (spaceshipRef.current) {
      spaceshipRef.current.position.y = 0.2 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      spaceshipRef.current.rotation.y = -Math.PI / 2;
      spaceshipRef.current.position.x = lane;
      spaceshipRef.current.position.z = 0;
    }
  });

  // Handle keyboard input
  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        moveLane('left');
      } else if (event.key === 'ArrowRight') {
        moveLane('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameStarted, gameOver, moveLane]);

  // Spawn obstacles
  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const interval = setInterval(() => {
      addObstacle({ id: Date.now(), position: [getRandomLane(), 0, -20] });
    }, levelSettings[level].spawnInterval);

    return () => clearInterval(interval);
  }, [isGameStarted, gameOver, level, addObstacle]);

  // Move obstacles and check collisions
  useFrame(() => {
    if (!isGameStarted || gameOver) return;

    updateObstacles(
      obstacles
        .map((obstacle) => ({
          ...obstacle,
          position: [
            obstacle.position[0] as number,
            0 as number,
            (obstacle.position[2] as number) + levelSettings[level].speed
          ] as [number, number, number],
        }))
        .filter((obstacle) => obstacle.position[2] < 5)
    );

    obstacleRefs.current.forEach((ref, index) => {
      if (ref && spaceshipRef.current) {
        const obstacleBox = new THREE.Box3().setFromObject(ref);
        const spaceshipBox = new THREE.Box3().setFromObject(spaceshipRef.current);
        if (obstacleBox.intersectsBox(spaceshipBox)) {
          setGameOver(true);
          const survivalTime = (Date.now() - startTimeRef.current) / 1000;
          setTime(survivalTime);
          const token = localStorage.getItem('token');
          if (token) {
            axios
              .post(
                '/api/game',
                { level, time: survivalTime },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then(() => console.log('Time saved:', survivalTime))
              .catch((error) => {
                console.error('Error saving time:', error.message);
                if (error.response?.status === 401) {
                  localStorage.removeItem('token');
                  router.push('/login');
                }
              });
          } else {
            router.push('/login');
          }
        }
      }
    });
  });

  // Track time
  useEffect(() => {
    if (isGameStarted && !gameOver) {
      startTimeRef.current = Date.now();
      const timer = setInterval(() => {
        setTime((Date.now() - startTimeRef.current) / 1000);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isGameStarted, gameOver, setTime]);

  // Camera follows spaceship
  useFrame(() => {
    camera.position.set(lane, 2, 5);
    camera.lookAt(lane, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <primitive
        object={scene}
        ref={spaceshipRef}
        position={[lane, 0, 0]}
        scale={[0.0015, 0.0015, 0.0015]}
      />
      {obstacles.map((obstacle, index) => (
        <mesh
          key={obstacle.id}
          position={obstacle.position as [number, number, number]}
          ref={(el) => (obstacleRefs.current[index] = el)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </>
  );
}

export default function GameCanvas() {
  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 75, near: 0.1, far: 100 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
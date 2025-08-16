import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { useGLTF, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const spaceship = '/models/spaceship.glb';

const getRandomLane = () => {
  const lanes = [-2, 0, 2];
  return lanes[Math.floor(Math.random() * lanes.length)];
};

/* ============================
   Quantum Cube (shader collectible)
   ============================ */

// Vertex + Fragment shaders (simple wave + color pulse)
const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Local position (object space)
    vec3 pos = position;

    // Subtle vertex displacement (floating wobble)
    pos.x += 0.12 * sin(uTime * 1.3 + pos.y * 6.0);
    pos.y += 0.12 * cos(uTime * 1.1 + pos.x * 6.0);
    pos.z += 0.12 * sin(uTime * 1.7 + pos.z * 6.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    // Neon-ish gradient that pulses
    float glow = 0.5 + 0.5 * sin(uTime * 2.0);
    vec3 a = vec3(0.10, 0.70, 1.00);
    vec3 b = vec3(0.85, 0.20, 1.00);
    vec3 color = mix(a, b, glow * 0.8 + 0.2);

    // Soft vignette
    float d = distance(vUv, vec2(0.5));
    color *= 1.0 - smoothstep(0.0, 0.8, d);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const QuantumMaterial = shaderMaterial(
  { uTime: 0 },
  vertexShader,
  fragmentShader
);
extend({ QuantumMaterial });

// A forwardRef component so parent can get the mesh for collision Box3
const QuantumCube = forwardRef(function QuantumCube({ position = [0, -10, 0] }, ref) {
  const meshRef = useRef();
  const matRef = useRef();

  useImperativeHandle(ref, () => meshRef.current);

  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uTime = state.clock.getElapsedTime();
    }
    if (meshRef.current) {
      // Gentle spin so it feels alive
      meshRef.current.rotation.y += delta * 0.6;
      meshRef.current.rotation.x += delta * 0.25;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      {/* More segments → smoother vertex waves */}
      <boxGeometry args={[1, 1, 1, 40, 40, 40]} />
      <quantumMaterial ref={matRef} />
    </mesh>
  );
});

/* ============================
   Main Scene
   ============================ */

function Scene({
  session,
  isGameStarted,
  gameOver,
  setGameOver,
  resetGame,
  obstacles,
  setObstacles,
  collectibles,
  setCollectibles,
  score,
  setScore
}) {
  const spaceshipRef = useRef();
  const { scene } = useGLTF(spaceship);
  const obstacleRefs = useRef([]);
  const collectibleRefs = useRef([]);
  const { camera, invalidate } = useThree();
  const startTimeRef = useRef(0);
  const lane = useRef(0);

  const setTime = (time) => console.log('Time:', time);

  const moveLane = (direction) => {
    if (direction === 'left' && lane.current > -2) lane.current -= 2;
    if (direction === 'right' && lane.current < 2) lane.current += 2;
  };

  const levelSettings = {
    easy: { speed: 0.08, spawnInterval: 3000 },
    medium: { speed: 0.12, spawnInterval: 2000 },
    hard: { speed: 0.15, spawnInterval: 1000 },
  };

  // Hovering ship motion + fixed rotation/position per lane
  useFrame((state) => {
    if (spaceshipRef.current) {
      spaceshipRef.current.position.y =
        0.2 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      spaceshipRef.current.rotation.y = -Math.PI / 2;
      spaceshipRef.current.position.x = lane.current;
      spaceshipRef.current.position.z = 0;
    }
  });

  // Keyboard lane movement
  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowLeft') {
        moveLane('left');
        invalidate();
      } else if (event.key === 'ArrowRight') {
        moveLane('right');
        invalidate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameStarted, gameOver, invalidate]);

  // Spawn obstacles & collectibles (never same lane)
  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const spawnInterval = setInterval(() => {
      const lanes = [-2, 0, 2];
      // Shuffle lanes quickly
      const shuffled = lanes.sort(() => 0.5 - Math.random());

      const newObstacle = { id: Date.now(), position: [shuffled[0], 0, -20] };

      const spawnCollectible = Math.random() < 0.5;
      const newCollectible =
        spawnCollectible && shuffled[1] !== undefined
          ? { id: Date.now() + 1, position: [shuffled[1], 0, -20] }
          : null;

      setObstacles((prev) => [...prev, newObstacle]);
      if (newCollectible) setCollectibles((prev) => [...prev, newCollectible]);

      invalidate();
    }, levelSettings['medium'].spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [isGameStarted, gameOver, invalidate, setObstacles, setCollectibles]);

  // Per-frame updates: movement, cleanup, collisions
  useFrame(() => {
    if (!isGameStarted || gameOver) return;

    // Move obstacles forward, mark for removal if passed camera
    const obstacleToRemove = [];
    obstacleRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.position.z += levelSettings['medium'].speed;
        if (ref.position.z > 5) {
          obstacleToRemove.push(obstacles[index]?.id);
        }
      }
    });
    if (obstacleToRemove.length) {
      setObstacles((prev) => prev.filter((o) => !obstacleToRemove.includes(o.id)));
    }

    // Move collectibles forward, mark for removal if passed camera
    const collectibleToRemove = [];
    collectibleRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.position.z += levelSettings['medium'].speed;
        if (ref.position.z > 5) {
          collectibleToRemove.push(collectibles[index]?.id);
        }
      }
    });
    if (collectibleToRemove.length) {
      setCollectibles((prev) => prev.filter((c) => !collectibleToRemove.includes(c.id)));
    }

    // Collision detection (obstacles)
    obstacleRefs.current.forEach((ref) => {
      if (ref && spaceshipRef.current) {
        const obstacleBox = new THREE.Box3().setFromObject(ref);
        const spaceshipBox = new THREE.Box3().setFromObject(spaceshipRef.current);
        if (obstacleBox.intersectsBox(spaceshipBox)) {
          setGameOver(true);
          const survivalTime = (Date.now() - startTimeRef.current) / 1000;
          setTime(survivalTime);
        }
      }
    });

    // Collision detection (collectibles)
    collectibleRefs.current.forEach((ref, index) => {
      if (ref && spaceshipRef.current) {
        const collectibleBox = new THREE.Box3().setFromObject(ref);
        const spaceshipBox = new THREE.Box3().setFromObject(spaceshipRef.current);
        if (collectibleBox.intersectsBox(spaceshipBox)) {
          if (collectibles[index]) collectibleToRemove.push(collectibles[index].id);
          setScore((prev) => prev + 1);
        }
      }
    });
    if (collectibleToRemove.length) {
      setCollectibles((prev) => prev.filter((c) => !collectibleToRemove.includes(c.id)));
    }

    invalidate();
  });

  // Timer
  useEffect(() => {
    if (isGameStarted && !gameOver) {
      startTimeRef.current = Date.now();
      const timer = setInterval(() => {
        setTime((Date.now() - startTimeRef.current) / 1000);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isGameStarted, gameOver]);

  // Camera follow
  useFrame(() => {
    camera.position.set(lane.current, 2, 5);
    camera.lookAt(lane.current, 0, 0);
  });

  // Full reset on Play Again
  useEffect(() => {
    if (resetGame) {
      lane.current = 0;
      setObstacles([]);
      setCollectibles([]);
      obstacleRefs.current = [];
      collectibleRefs.current = [];
      setGameOver(false);
      setScore(0);

      if (spaceshipRef.current) {
        spaceshipRef.current.position.set(0, 0, 0);
      }
      camera.position.set(0, 2, 5);
      camera.lookAt(0, 0, 0);

      startTimeRef.current = Date.now();
      invalidate();
    }
  }, [resetGame, camera, setGameOver, invalidate, setObstacles, setCollectibles, setScore]);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />

      {/* Player Ship */}
      <primitive
        object={scene}
        ref={spaceshipRef}
        position={[lane.current, 0, 0]}
        scale={[0.0015, 0.0015, 0.0015]}
      />

      {/* Obstacles */}
      {obstacles.map((obstacle, index) => (
        <mesh
          key={obstacle.id}
          position={obstacle.position}
          ref={(el) => (obstacleRefs.current[index] = el)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}

      {/* Collectibles (Quantum Shader Cubes) */}
      {collectibles.map((collectible, index) => (
        <QuantumCube
          key={collectible.id}
          position={collectible.position}
          ref={(el) => (collectibleRefs.current[index] = el)}
        />
      ))}

      {/* Colored lane markers */}
      {/* <mesh position={[-2, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 100]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 100]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[2, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 100]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 100]} />
        <meshStandardMaterial color="gray" opacity={0.5} transparent />
      </mesh> */}
    </>
  );
}

/* ============================
   Page Wrapper
   ============================ */

export default function GamePage({ session }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [resetGame, setResetGame] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [collectibles, setCollectibles] = useState([]);
  const [score, setScore] = useState(0);

  const handleStartGame = () => {
    if (session) {
      setIsGameStarted(true);
      setGameOver(false);
      setResetGame(false);
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.error('Full-screen request failed:', err);
        });
      }
    }
  };

  const handlePlayAgain = () => {
    setResetGame(true);
    setIsGameStarted(true);
    setGameOver(false);
    // allow effects to see resetGame true
    setTimeout(() => setResetGame(false), 50);

    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error('Full-screen request failed:', err);
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden' }}>
      {session ? (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          {!isGameStarted && (
            <button
              onClick={handleStartGame}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              Start Game
            </button>
          )}
          {gameOver && (
            <button
              onClick={handlePlayAgain}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              Play Again
            </button>
          )}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              color: 'white',
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '5px 10px',
            }}
          >
            Score: {score}
          </div>
          <Canvas
            camera={{ position: [0, 2, 5], fov: 75, near: 0.1, far: 100 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
            gl={{ antialias: true }}
            frameloop="always"
            onCreated={({ gl }) => {
              gl.setSize(window.innerWidth, window.innerHeight);
              gl.domElement.style.position = 'absolute';
            }}
          >
            <Scene
              session={session}
              isGameStarted={isGameStarted}
              gameOver={gameOver}
              setGameOver={setGameOver}
              resetGame={resetGame}
              obstacles={obstacles}
              setObstacles={setObstacles}
              collectibles={collectibles}
              setCollectibles={setCollectibles}
              score={score}
              setScore={setScore}
            />
          </Canvas>
        </div>
      ) : (
        <p>Please log in to play the game.</p>
      )}
    </div>
  );
}

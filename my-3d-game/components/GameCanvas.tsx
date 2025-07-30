import { useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import axios from 'axios';
import * as THREE from 'three';
import { Dispatch, SetStateAction } from 'react';

interface GameCanvasProps {
  setScore: Dispatch<SetStateAction<number>>;
}

interface SceneProps {
  setScore: Dispatch<SetStateAction<number>>;
}

// Generate random position within bounds
const getRandomPosition = (): [number, number, number] => {
  const min = -2;
  const max = 2;
  return [
    Math.random() * (max - min) + min,
    Math.random() * (max - min) + min,
    Math.random() * (max - min) + min,
  ];
};

function Scene({ setScore }: SceneProps) {
  const [collectibles, setCollectibles] = useState([
    { id: 1, position: getRandomPosition() },
    { id: 2, position: getRandomPosition() },
    { id: 3, position: getRandomPosition() },
  ]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const { scene, camera, gl } = useThree();
  const collectibleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const clickMarkerRef = useRef<THREE.Mesh | null>(null);

  // Rotate central cube
  useEffect(() => {
    const cube = scene.getObjectByName('centerCube');
    const animate = () => {
      if (cube) cube.rotation.y += 0.01;
      requestAnimationFrame(animate);
    };
    animate();
  }, [scene]);

  // Handle click to collect cubes
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    // Get canvas bounding rect for accurate mouse coords
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    raycaster.current.layers.set(0); // Default layer
    const validRefs = collectibleRefs.current.filter((ref): ref is THREE.Mesh => ref !== null && ref.visible);
    console.log('Valid refs for raycasting:', validRefs.length, validRefs.map(ref => ref.userData.id));
    console.log('Camera position:', camera.position);
    console.log('Mouse coords:', mouse.current.x, mouse.current.y);
    console.log('Canvas rect:', rect);
    const intersects = raycaster.current.intersectObjects(validRefs, true);

    // Add click marker
    if (clickMarkerRef.current) scene.remove(clickMarkerRef.current);
    const rayEnd = raycaster.current.ray.origin.clone().add(raycaster.current.ray.direction.clone().multiplyScalar(5));
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' });
    clickMarkerRef.current = new THREE.Mesh(markerGeometry, markerMaterial);
    clickMarkerRef.current.position.copy(rayEnd);
    scene.add(clickMarkerRef.current);
    setTimeout(() => {
      if (clickMarkerRef.current) scene.remove(clickMarkerRef.current);
    }, 500);

    if (intersects.length > 0) {
      const collectible = intersects[0].object;
      collectible.visible = false;
      const newCollectibles = collectibles.filter((c) => c.id !== collectible.userData.id);
      setCollectibles(newCollectibles);
      setScore((prevScore) => {
        const newScore = prevScore + 1;
        const token = localStorage.getItem('token');
        if (token) {
          axios
            .post(
              '/api/game',
              { score: newScore },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .then(() => console.log('Score saved:', newScore))
            .catch((error) => console.error('Error saving score:', error.message));
        } else {
          console.error('No token found for score update');
        }
        return newScore;
      });
      console.log('Collectible clicked:', collectible.userData.id, 'New collectibles:', newCollectibles.length);
      console.log('Intersection point:', intersects[0].point);
    } else {
      console.log('No collectibles intersected');
      console.log('Ray direction:', raycaster.current.ray.direction);
    }
  };

  // Attach click handler
  useEffect(() => {
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [gl]);

  // Debug refs and cube screen positions
  useEffect(() => {
    const validRefs = collectibleRefs.current.filter((ref): ref is THREE.Mesh => ref !== null && ref.visible);
    console.log('Collectible refs updated:', collectibleRefs.current.map(ref => ref?.userData.id));
    console.log('Scene objects:', scene.children.map(obj => obj.name || obj.type));
    console.log('Cube positions:', collectibles.map(c => c.position));
    validRefs.forEach(ref => {
      const vector = new THREE.Vector3();
      ref.getWorldPosition(vector);
      vector.project(camera);
      console.log(`Cube ${ref.userData.id} screen pos:`, vector.x, vector.y);
    });
  }, [collectibles, scene, camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh name="centerCube">
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      {collectibles.map((collectible, index) => (
        <mesh
          key={collectible.id}
          position={collectible.position as [number, number, number]}
          userData={{ isCollectible: true, id: collectible.id }}
          ref={(el: THREE.Mesh | null) => {
            collectibleRefs.current[index] = el;
            if (el) el.geometry.computeBoundingBox(); // Ensure bounding box for raycasting
          }}
        >
          <boxGeometry args={[1, 1, 1]} /> {/* Increased size */}
          <meshStandardMaterial color="red" />
        </mesh>
      ))}
    </>
  );
}

export default function GameCanvas({ setScore }: GameCanvasProps) {
  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 100 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <Scene setScore={setScore} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <p style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
          Click the red cubes to collect them!
        </p>
      </div>
    </div>
  );
}
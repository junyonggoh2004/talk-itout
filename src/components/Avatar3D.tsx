import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EmotionType } from '@/utils/visemeMapping';

interface AvatarHeadProps {
  emotion: EmotionType;
  audioVolume: number;
  isSpeaking: boolean;
}

// Simple stylized avatar head with animated features
const AvatarHead = ({ emotion, audioVolume, isSpeaking }: AvatarHeadProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);
  
  const targetMouthOpen = useRef(0);
  const currentMouthOpen = useRef(0);
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Subtle idle head movement
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;

    // Mouth animation based on audio volume
    if (isSpeaking) {
      targetMouthOpen.current = Math.min(audioVolume * 1.5, 0.8);
    } else {
      targetMouthOpen.current = 0;
    }
    
    currentMouthOpen.current = THREE.MathUtils.lerp(
      currentMouthOpen.current,
      targetMouthOpen.current,
      delta * 15
    );

    // Apply mouth shape
    if (mouthRef.current) {
      mouthRef.current.scale.y = 0.3 + currentMouthOpen.current * 0.7;
      mouthRef.current.position.y = -0.35 - currentMouthOpen.current * 0.1;
    }

    // Blinking
    blinkTimer.current += delta;
    if (blinkTimer.current > 3 + Math.random() * 2) {
      isBlinking.current = true;
      blinkTimer.current = 0;
    }
    
    if (isBlinking.current) {
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 0.1, delta * 20);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 0.1, delta * 20);
        
        if (leftEyeRef.current.scale.y < 0.15) {
          isBlinking.current = false;
        }
      }
    } else {
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 1, delta * 10);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 1, delta * 10);
      }
    }

    // Emotion-based eyebrow positions
    if (leftBrowRef.current && rightBrowRef.current) {
      let browY = 0.55;
      let browRotation = 0;
      
      switch (emotion) {
        case 'happy':
          browY = 0.6;
          browRotation = 0.1;
          break;
        case 'sad':
          browY = 0.5;
          browRotation = -0.2;
          break;
        case 'concerned':
          browY = 0.52;
          browRotation = -0.15;
          break;
        case 'surprised':
          browY = 0.65;
          browRotation = 0;
          break;
        case 'thinking':
          browY = 0.55;
          leftBrowRef.current.rotation.z = THREE.MathUtils.lerp(leftBrowRef.current.rotation.z, 0.2, delta * 5);
          rightBrowRef.current.rotation.z = THREE.MathUtils.lerp(rightBrowRef.current.rotation.z, -0.1, delta * 5);
          leftBrowRef.current.position.y = THREE.MathUtils.lerp(leftBrowRef.current.position.y, 0.58, delta * 5);
          rightBrowRef.current.position.y = THREE.MathUtils.lerp(rightBrowRef.current.position.y, 0.52, delta * 5);
          return;
        default:
          browY = 0.55;
          browRotation = 0;
      }
      
      leftBrowRef.current.position.y = THREE.MathUtils.lerp(leftBrowRef.current.position.y, browY, delta * 5);
      rightBrowRef.current.position.y = THREE.MathUtils.lerp(rightBrowRef.current.position.y, browY, delta * 5);
      leftBrowRef.current.rotation.z = THREE.MathUtils.lerp(leftBrowRef.current.rotation.z, browRotation, delta * 5);
      rightBrowRef.current.rotation.z = THREE.MathUtils.lerp(rightBrowRef.current.rotation.z, -browRotation, delta * 5);
    }
  });

  // Skin tone color
  const skinColor = '#e8beac';
  const hairColor = '#4a3728';
  const eyeColor = '#3d5a80';
  const mouthColor = '#c17c74';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 0.35, -0.1]}>
        <sphereGeometry args={[0.75, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>
      
      {/* Left Eye */}
      <group position={[-0.25, 0.15, 0.6]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh ref={leftEyeRef} position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={eyeColor} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
      
      {/* Right Eye */}
      <group position={[0.25, 0.15, 0.6]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh ref={rightEyeRef} position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={eyeColor} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
      
      {/* Left Eyebrow */}
      <mesh ref={leftBrowRef} position={[-0.25, 0.55, 0.65]}>
        <boxGeometry args={[0.2, 0.05, 0.05]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* Right Eyebrow */}
      <mesh ref={rightBrowRef} position={[0.25, 0.55, 0.65]}>
        <boxGeometry args={[0.2, 0.05, 0.05]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, -0.05, 0.75]}>
        <coneGeometry args={[0.08, 0.15, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.35, 0.7]}>
        <capsuleGeometry args={[0.08, 0.15, 8, 16]} />
        <meshStandardMaterial color={mouthColor} roughness={0.4} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-0.78, 0.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.78, 0.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.4, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      
      {/* Shoulders hint */}
      <mesh position={[0, -1.2, 0]}>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color="#5c7a99" roughness={0.7} />
      </mesh>
    </group>
  );
};

interface Avatar3DProps {
  emotion: EmotionType;
  audioVolume: number;
  isSpeaking: boolean;
  currentText: string;
}

const Avatar3D = ({ emotion, audioVolume, isSpeaking }: Avatar3DProps) => {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-secondary/20">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, 3]} intensity={0.4} />
        <pointLight position={[0, 0, 5]} intensity={0.3} />
        
        <AvatarHead
          emotion={emotion}
          audioVolume={audioVolume}
          isSpeaking={isSpeaking}
        />
        
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
};

export default Avatar3D;

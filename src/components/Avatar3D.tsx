import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EmotionType, emotionBlendShapes, VisemeType } from '@/utils/visemeMapping';

// User's Ready Player Me avatar with morph targets
const AVATAR_URL = 'https://models.readyplayer.me/69379428347390125d70b6e2.glb?morphTargets=ARKit,Oculus+Visemes';

interface AvatarModelProps {
  emotion: EmotionType;
  audioVolume: number;
  isSpeaking: boolean;
  currentViseme: VisemeType;
}

const AvatarModel = ({ emotion, audioVolume, isSpeaking, currentViseme }: AvatarModelProps) => {
  const { scene } = useGLTF(AVATAR_URL);
  const meshRef = useRef<THREE.SkinnedMesh | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const targetMorphsRef = useRef<Record<string, number>>({});
  const currentMorphsRef = useRef<Record<string, number>>({});
  
  // Find the mesh with morph targets
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          meshRef.current = mesh;
          console.log('Found morph targets:', Object.keys(mesh.morphTargetDictionary));
        }
      }
    });
  }, [scene]);

  // Update emotion blend shapes
  useEffect(() => {
    const emotionShapes = emotionBlendShapes[emotion] || {};
    targetMorphsRef.current = { ...emotionShapes };
  }, [emotion]);

  // Animation loop
  useFrame((state, delta) => {
    // Subtle idle animation
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.02 - 1.5;
    }

    if (!meshRef.current?.morphTargetDictionary || !meshRef.current?.morphTargetInfluences) {
      return;
    }

    const mesh = meshRef.current;
    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;
    
    // Smooth interpolation speed
    const lerpSpeed = delta * 8;
    
    // Reset all morph targets gradually
    for (let i = 0; i < influences.length; i++) {
      influences[i] = THREE.MathUtils.lerp(influences[i], 0, lerpSpeed);
    }
    
    // Apply emotion blend shapes
    Object.entries(targetMorphsRef.current).forEach(([shapeName, targetValue]) => {
      const index = dict[shapeName];
      if (index !== undefined) {
        currentMorphsRef.current[shapeName] = THREE.MathUtils.lerp(
          currentMorphsRef.current[shapeName] || 0,
          targetValue,
          lerpSpeed
        );
        influences[index] = currentMorphsRef.current[shapeName];
      }
    });
    
    // Apply lip sync based on viseme and audio volume
    if (isSpeaking && audioVolume > 0.05) {
      // Try different viseme naming conventions
      const visemeVariants = [
        currentViseme,
        currentViseme.replace('viseme_', ''),
        `viseme${currentViseme.replace('viseme_', '')}`,
      ];
      
      for (const visemeName of visemeVariants) {
        if (dict[visemeName] !== undefined) {
          const targetInfluence = Math.min(audioVolume * 1.5, 1);
          influences[dict[visemeName]] = THREE.MathUtils.lerp(
            influences[dict[visemeName]],
            targetInfluence,
            lerpSpeed * 2
          );
          break;
        }
      }
      
      // Also add jaw movement based on volume
      const jawVariants = ['jawOpen', 'mouthOpen', 'viseme_aa'];
      for (const jawName of jawVariants) {
        if (dict[jawName] !== undefined) {
          const jawTarget = audioVolume * 0.5;
          influences[dict[jawName]] = THREE.MathUtils.lerp(
            influences[dict[jawName]],
            jawTarget,
            lerpSpeed * 2
          );
          break;
        }
      }
    }
    
    // Subtle idle animations - blinking
    const time = Date.now() * 0.001;
    const blinkCycle = Math.sin(time * 0.5) > 0.98;
    
    if (blinkCycle) {
      const blinkTargets = ['eyeBlinkLeft', 'eyesClosed', 'eyeBlink_L'];
      for (const blinkName of blinkTargets) {
        if (dict[blinkName] !== undefined) {
          influences[dict[blinkName]] = 1;
        }
      }
      const blinkTargetsR = ['eyeBlinkRight', 'eyeBlink_R'];
      for (const blinkName of blinkTargetsR) {
        if (dict[blinkName] !== undefined) {
          influences[dict[blinkName]] = 1;
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={1.8} 
        position={[0, -1.5, 0]} 
        rotation={[0.05, 0, 0]}
      />
    </group>
  );
};

// Fallback geometric avatar
const FallbackAvatar = ({ emotion, audioVolume, isSpeaking }: Omit<AvatarModelProps, 'currentViseme'>) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const currentMouthOpen = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;

    if (isSpeaking) {
      currentMouthOpen.current = THREE.MathUtils.lerp(currentMouthOpen.current, audioVolume * 0.8, delta * 15);
    } else {
      currentMouthOpen.current = THREE.MathUtils.lerp(currentMouthOpen.current, 0, delta * 10);
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y = 0.3 + currentMouthOpen.current * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh><sphereGeometry args={[0.8, 32, 32]} /><meshStandardMaterial color="#e8beac" /></mesh>
      <mesh position={[-0.25, 0.15, 0.65]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#3d5a80" /></mesh>
      <mesh position={[0.25, 0.15, 0.65]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#3d5a80" /></mesh>
      <mesh ref={mouthRef} position={[0, -0.35, 0.7]}><capsuleGeometry args={[0.08, 0.15, 8, 16]} /><meshStandardMaterial color="#c17c74" /></mesh>
    </group>
  );
};

interface Avatar3DProps {
  emotion: EmotionType;
  audioVolume: number;
  isSpeaking: boolean;
  currentText: string;
}

const Avatar3D = ({ emotion, audioVolume, isSpeaking, currentText }: Avatar3DProps) => {
  const [currentViseme, setCurrentViseme] = useState<VisemeType>('viseme_sil');
  const [modelError, setModelError] = useState(false);
  const visemeIndexRef = useRef(0);
  
  // Animate through visemes based on text while speaking
  useEffect(() => {
    if (!isSpeaking || !currentText) {
      setCurrentViseme('viseme_sil');
      visemeIndexRef.current = 0;
      return;
    }
    
    const text = currentText.toLowerCase();
    const charToVisemeMap: Record<string, VisemeType> = {
      'a': 'viseme_aa', 'e': 'viseme_E', 'i': 'viseme_I', 'o': 'viseme_O', 'u': 'viseme_U',
      'b': 'viseme_PP', 'p': 'viseme_PP', 'm': 'viseme_PP',
      'f': 'viseme_FF', 'v': 'viseme_FF',
      't': 'viseme_DD', 'd': 'viseme_DD', 'n': 'viseme_nn', 'l': 'viseme_nn',
      'k': 'viseme_kk', 'g': 'viseme_kk',
      's': 'viseme_SS', 'z': 'viseme_SS',
      'r': 'viseme_RR',
      'w': 'viseme_U',
      'j': 'viseme_CH', 'c': 'viseme_CH',
    };
    
    const interval = setInterval(() => {
      if (visemeIndexRef.current >= text.length) {
        visemeIndexRef.current = 0;
      }
      
      const char = text[visemeIndexRef.current];
      const viseme = charToVisemeMap[char] || 'viseme_sil';
      setCurrentViseme(viseme);
      visemeIndexRef.current++;
    }, 80);
    
    return () => clearInterval(interval);
  }, [isSpeaking, currentText]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-secondary/20">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onError={() => setModelError(true)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, 3]} intensity={0.4} />
        
        <Suspense fallback={null}>
          {!modelError ? (
            <AvatarModel
              emotion={emotion}
              audioVolume={audioVolume}
              isSpeaking={isSpeaking}
              currentViseme={currentViseme}
            />
          ) : (
            <FallbackAvatar
              emotion={emotion}
              audioVolume={audioVolume}
              isSpeaking={isSpeaking}
            />
          )}
          <Environment preset="apartment" />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};

// Preload the avatar model
useGLTF.preload(AVATAR_URL);

export default Avatar3D;

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
  const meshesRef = useRef<THREE.SkinnedMesh[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const targetMorphsRef = useRef<Record<string, number>>({});
  
  // Find ALL meshes with morph targets
  useEffect(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          meshes.push(mesh);
        }
      }
    });
    meshesRef.current = meshes;
    console.log(`Found ${meshes.length} meshes with morph targets`);
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

    // Apply morph targets to ALL meshes
    for (const mesh of meshesRef.current) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) continue;

      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      const lerpSpeed = delta * 12;
      
      // Reset non-active morph targets gradually
      for (let i = 0; i < influences.length; i++) {
        if (influences[i] > 0.01) {
          influences[i] = THREE.MathUtils.lerp(influences[i], 0, lerpSpeed * 0.5);
        }
      }
      
      // Apply emotion blend shapes
      Object.entries(targetMorphsRef.current).forEach(([shapeName, targetValue]) => {
        if (dict[shapeName] !== undefined) {
          influences[dict[shapeName]] = THREE.MathUtils.lerp(
            influences[dict[shapeName]],
            targetValue,
            lerpSpeed
          );
        }
      });
      
      // Apply lip sync when speaking
      if (isSpeaking && audioVolume > 0.01) {
        // Apply current viseme
        if (dict[currentViseme] !== undefined) {
          const visemeIntensity = Math.min(audioVolume * 1.8, 1);
          influences[dict[currentViseme]] = THREE.MathUtils.lerp(
            influences[dict[currentViseme]],
            visemeIntensity,
            lerpSpeed * 1.5
          );
        }
        
        // Also drive jaw open for more visible mouth movement
        if (dict['jawOpen'] !== undefined) {
          const jawIntensity = audioVolume * 0.6;
          influences[dict['jawOpen']] = THREE.MathUtils.lerp(
            influences[dict['jawOpen']],
            jawIntensity,
            lerpSpeed * 1.5
          );
        }
        
        // Add some mouth movement
        if (dict['mouthOpen'] !== undefined) {
          influences[dict['mouthOpen']] = THREE.MathUtils.lerp(
            influences[dict['mouthOpen']],
            audioVolume * 0.5,
            lerpSpeed * 1.5
          );
        }
      }
      
      // Blinking animation
      const time = Date.now() * 0.001;
      const shouldBlink = Math.sin(time * 0.5) > 0.97;
      
      if (shouldBlink) {
        if (dict['eyeBlinkLeft'] !== undefined) {
          influences[dict['eyeBlinkLeft']] = 1;
        }
        if (dict['eyeBlinkRight'] !== undefined) {
          influences[dict['eyeBlinkRight']] = 1;
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

interface Avatar3DProps {
  emotion: EmotionType;
  audioVolume: number;
  isSpeaking: boolean;
  currentText: string;
}

const Avatar3D = ({ emotion, audioVolume, isSpeaking, currentText }: Avatar3DProps) => {
  const [currentViseme, setCurrentViseme] = useState<VisemeType>('viseme_sil');
  const visemeIndexRef = useRef(0);
  
  // Debug logging
  useEffect(() => {
    console.log('Avatar3D state:', { isSpeaking, audioVolume: audioVolume.toFixed(2), currentViseme });
  }, [isSpeaking, audioVolume, currentViseme]);
  
  // Animate through visemes based on text while speaking
  useEffect(() => {
    if (!isSpeaking || !currentText) {
      setCurrentViseme('viseme_sil');
      visemeIndexRef.current = 0;
      return;
    }
    
    const text = currentText.toLowerCase().replace(/[^a-z]/g, '');
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
      'h': 'viseme_sil',
      'x': 'viseme_SS',
      'y': 'viseme_I',
      'q': 'viseme_kk',
    };
    
    const interval = setInterval(() => {
      if (text.length === 0) return;
      
      if (visemeIndexRef.current >= text.length) {
        visemeIndexRef.current = 0;
      }
      
      const char = text[visemeIndexRef.current];
      const viseme = charToVisemeMap[char] || 'viseme_aa';
      setCurrentViseme(viseme);
      visemeIndexRef.current++;
    }, 70); // Slightly faster for more dynamic movement
    
    return () => clearInterval(interval);
  }, [isSpeaking, currentText]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-secondary/20">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, 3]} intensity={0.4} />
        
        <Suspense fallback={null}>
          <AvatarModel
            emotion={emotion}
            audioVolume={audioVolume}
            isSpeaking={isSpeaking}
            currentViseme={currentViseme}
          />
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

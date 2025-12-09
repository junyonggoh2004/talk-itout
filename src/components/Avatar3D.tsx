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
  
  // Bone references for hand animation
  const bonesRef = useRef<{
    rightArm?: THREE.Bone;
    rightForeArm?: THREE.Bone;
    rightHand?: THREE.Bone;
    leftArm?: THREE.Bone;
    leftForeArm?: THREE.Bone;
    leftHand?: THREE.Bone;
    spine?: THREE.Bone;
  }>({});
  
  // Store initial bone rotations
  const initialRotationsRef = useRef<Record<string, THREE.Euler>>({});
  
  // Find ALL meshes with morph targets and bones
  useEffect(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    scene.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          meshes.push(mesh);
        }
      }
      
      // Find bones by name
      if ((child as THREE.Bone).isBone) {
        const bone = child as THREE.Bone;
        const name = bone.name.toLowerCase();
        
        if (name.includes('rightarm') && !name.includes('fore')) {
          bonesRef.current.rightArm = bone;
          initialRotationsRef.current.rightArm = bone.rotation.clone();
        } else if (name.includes('rightforearm')) {
          bonesRef.current.rightForeArm = bone;
          initialRotationsRef.current.rightForeArm = bone.rotation.clone();
        } else if (name.includes('righthand')) {
          bonesRef.current.rightHand = bone;
          initialRotationsRef.current.rightHand = bone.rotation.clone();
        } else if (name.includes('leftarm') && !name.includes('fore')) {
          bonesRef.current.leftArm = bone;
          initialRotationsRef.current.leftArm = bone.rotation.clone();
        } else if (name.includes('leftforearm')) {
          bonesRef.current.leftForeArm = bone;
          initialRotationsRef.current.leftForeArm = bone.rotation.clone();
        } else if (name.includes('lefthand')) {
          bonesRef.current.leftHand = bone;
          initialRotationsRef.current.leftHand = bone.rotation.clone();
        } else if (name === 'spine' || name.includes('spine1')) {
          bonesRef.current.spine = bone;
          initialRotationsRef.current.spine = bone.rotation.clone();
        }
      }
    });
    meshesRef.current = meshes;
    console.log('Found bones:', Object.keys(bonesRef.current).filter(k => bonesRef.current[k as keyof typeof bonesRef.current]));
  }, [scene]);

  // Update emotion blend shapes
  useEffect(() => {
    const emotionShapes = emotionBlendShapes[emotion] || {};
    targetMorphsRef.current = { ...emotionShapes };
  }, [emotion]);

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Subtle idle animation for the whole model
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.02 - 1.5;
    }

    // Hand/arm gestures while speaking
    const bones = bonesRef.current;
    const lerpSpeed = delta * 3;
    
    if (isSpeaking) {
      // Expressive right arm gesture while talking
      if (bones.rightArm && initialRotationsRef.current.rightArm) {
        const gestureAmount = Math.sin(time * 2.5) * 0.08;
        bones.rightArm.rotation.z = THREE.MathUtils.lerp(
          bones.rightArm.rotation.z,
          initialRotationsRef.current.rightArm.z + gestureAmount,
          lerpSpeed
        );
        bones.rightArm.rotation.x = THREE.MathUtils.lerp(
          bones.rightArm.rotation.x,
          initialRotationsRef.current.rightArm.x + Math.sin(time * 1.8) * 0.1,
          lerpSpeed
        );
      }
      
      if (bones.rightForeArm && initialRotationsRef.current.rightForeArm) {
        const forearmGesture = Math.sin(time * 3) * 0.15;
        bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(
          bones.rightForeArm.rotation.y,
          initialRotationsRef.current.rightForeArm.y + forearmGesture,
          lerpSpeed
        );
        bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(
          bones.rightForeArm.rotation.z,
          initialRotationsRef.current.rightForeArm.z + Math.sin(time * 2.2) * 0.1,
          lerpSpeed
        );
      }
      
      if (bones.rightHand && initialRotationsRef.current.rightHand) {
        const handGesture = Math.sin(time * 3.5) * 0.2;
        bones.rightHand.rotation.z = THREE.MathUtils.lerp(
          bones.rightHand.rotation.z,
          initialRotationsRef.current.rightHand.z + handGesture,
          lerpSpeed
        );
        bones.rightHand.rotation.x = THREE.MathUtils.lerp(
          bones.rightHand.rotation.x,
          initialRotationsRef.current.rightHand.x + Math.sin(time * 2.8) * 0.15,
          lerpSpeed
        );
      }
      
      // More expressive left arm movement
      if (bones.leftArm && initialRotationsRef.current.leftArm) {
        const leftGesture = Math.sin(time * 2 + 1.5) * 0.05;
        bones.leftArm.rotation.z = THREE.MathUtils.lerp(
          bones.leftArm.rotation.z,
          initialRotationsRef.current.leftArm.z + leftGesture,
          lerpSpeed
        );
        bones.leftArm.rotation.x = THREE.MathUtils.lerp(
          bones.leftArm.rotation.x,
          initialRotationsRef.current.leftArm.x + Math.sin(time * 1.6 + 0.5) * 0.06,
          lerpSpeed
        );
      }
      
      if (bones.leftForeArm && initialRotationsRef.current.leftForeArm) {
        bones.leftForeArm.rotation.y = THREE.MathUtils.lerp(
          bones.leftForeArm.rotation.y,
          initialRotationsRef.current.leftForeArm.y + Math.sin(time * 2.3 + 1) * 0.08,
          lerpSpeed
        );
      }
    } else {
      // Return to idle pose when not speaking
      if (bones.rightArm && initialRotationsRef.current.rightArm) {
        bones.rightArm.rotation.x = THREE.MathUtils.lerp(bones.rightArm.rotation.x, initialRotationsRef.current.rightArm.x, lerpSpeed);
        bones.rightArm.rotation.z = THREE.MathUtils.lerp(bones.rightArm.rotation.z, initialRotationsRef.current.rightArm.z, lerpSpeed);
      }
      if (bones.rightForeArm && initialRotationsRef.current.rightForeArm) {
        bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(bones.rightForeArm.rotation.y, initialRotationsRef.current.rightForeArm.y, lerpSpeed);
        bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.rightForeArm.rotation.z, initialRotationsRef.current.rightForeArm.z, lerpSpeed);
      }
      if (bones.rightHand && initialRotationsRef.current.rightHand) {
        bones.rightHand.rotation.z = THREE.MathUtils.lerp(bones.rightHand.rotation.z, initialRotationsRef.current.rightHand.z, lerpSpeed);
        bones.rightHand.rotation.x = THREE.MathUtils.lerp(bones.rightHand.rotation.x, initialRotationsRef.current.rightHand.x, lerpSpeed);
      }
      if (bones.leftArm && initialRotationsRef.current.leftArm) {
        bones.leftArm.rotation.z = THREE.MathUtils.lerp(bones.leftArm.rotation.z, initialRotationsRef.current.leftArm.z, lerpSpeed);
        bones.leftArm.rotation.x = THREE.MathUtils.lerp(bones.leftArm.rotation.x, initialRotationsRef.current.leftArm.x, lerpSpeed);
      }
      if (bones.leftForeArm && initialRotationsRef.current.leftForeArm) {
        bones.leftForeArm.rotation.y = THREE.MathUtils.lerp(bones.leftForeArm.rotation.y, initialRotationsRef.current.leftForeArm.y, lerpSpeed);
      }
    }

    // Apply morph targets to ALL meshes
    for (const mesh of meshesRef.current) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) continue;

      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      const morphLerpSpeed = delta * 12;
      
      // Reset non-active morph targets gradually
      for (let i = 0; i < influences.length; i++) {
        if (influences[i] > 0.01) {
          influences[i] = THREE.MathUtils.lerp(influences[i], 0, morphLerpSpeed * 0.5);
        }
      }
      
      // Apply emotion blend shapes
      Object.entries(targetMorphsRef.current).forEach(([shapeName, targetValue]) => {
        if (dict[shapeName] !== undefined) {
          influences[dict[shapeName]] = THREE.MathUtils.lerp(
            influences[dict[shapeName]],
            targetValue,
            morphLerpSpeed
          );
        }
      });
      
      // Apply lip sync when speaking - reduced sensitivity for natural movement
      if (isSpeaking && audioVolume > 0.05) {
        // Apply current viseme with reduced intensity
        if (dict[currentViseme] !== undefined) {
          const visemeIntensity = Math.min(audioVolume * 0.6, 0.5);
          influences[dict[currentViseme]] = THREE.MathUtils.lerp(
            influences[dict[currentViseme]],
            visemeIntensity,
            morphLerpSpeed
          );
        }
        
        // Subtle jaw movement
        if (dict['jawOpen'] !== undefined) {
          const jawIntensity = Math.min(audioVolume * 0.25, 0.3);
          influences[dict['jawOpen']] = THREE.MathUtils.lerp(
            influences[dict['jawOpen']],
            jawIntensity,
            morphLerpSpeed
          );
        }
      }
      
      // Blinking animation
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
    }, 70);
    
    return () => clearInterval(interval);
  }, [isSpeaking, currentText]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-secondary/20">
      <Canvas
        camera={{ position: [0, 0.2, 4], fov: 40 }}
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

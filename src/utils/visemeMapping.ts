// Viseme mapping for lip sync animation
// Maps phonemes/characters to mouth shape blend targets

export type VisemeType = 
  | 'viseme_sil'   // Silence
  | 'viseme_PP'    // p, b, m
  | 'viseme_FF'    // f, v
  | 'viseme_TH'    // th
  | 'viseme_DD'    // t, d
  | 'viseme_kk'    // k, g
  | 'viseme_CH'    // ch, j, sh
  | 'viseme_SS'    // s, z
  | 'viseme_nn'    // n, l
  | 'viseme_RR'    // r
  | 'viseme_aa'    // a
  | 'viseme_E'     // e
  | 'viseme_I'     // i
  | 'viseme_O'     // o
  | 'viseme_U';    // u

// Character to viseme mapping
export const charToViseme: Record<string, VisemeType> = {
  'a': 'viseme_aa',
  'b': 'viseme_PP',
  'c': 'viseme_kk',
  'd': 'viseme_DD',
  'e': 'viseme_E',
  'f': 'viseme_FF',
  'g': 'viseme_kk',
  'h': 'viseme_sil',
  'i': 'viseme_I',
  'j': 'viseme_CH',
  'k': 'viseme_kk',
  'l': 'viseme_nn',
  'm': 'viseme_PP',
  'n': 'viseme_nn',
  'o': 'viseme_O',
  'p': 'viseme_PP',
  'q': 'viseme_kk',
  'r': 'viseme_RR',
  's': 'viseme_SS',
  't': 'viseme_DD',
  'u': 'viseme_U',
  'v': 'viseme_FF',
  'w': 'viseme_U',
  'x': 'viseme_SS',
  'y': 'viseme_I',
  'z': 'viseme_SS',
  ' ': 'viseme_sil',
  '.': 'viseme_sil',
  ',': 'viseme_sil',
  '!': 'viseme_sil',
  '?': 'viseme_sil',
};

// Viseme blend shape indices for Ready Player Me avatars
export const visemeBlendShapes: Record<VisemeType, number> = {
  'viseme_sil': 0,
  'viseme_PP': 1,
  'viseme_FF': 2,
  'viseme_TH': 3,
  'viseme_DD': 4,
  'viseme_kk': 5,
  'viseme_CH': 6,
  'viseme_SS': 7,
  'viseme_nn': 8,
  'viseme_RR': 9,
  'viseme_aa': 10,
  'viseme_E': 11,
  'viseme_I': 12,
  'viseme_O': 13,
  'viseme_U': 14,
};

// Get viseme sequence from text
export const textToVisemeSequence = (text: string): VisemeType[] => {
  const visemes: VisemeType[] = [];
  const lowerText = text.toLowerCase();
  
  for (let i = 0; i < lowerText.length; i++) {
    const char = lowerText[i];
    const viseme = charToViseme[char] || 'viseme_sil';
    visemes.push(viseme);
  }
  
  return visemes;
};

// Emotion types for facial expressions
export type EmotionType = 'neutral' | 'happy' | 'sad' | 'concerned' | 'surprised' | 'thinking';

// Emotion blend shape configurations
export const emotionBlendShapes: Record<EmotionType, Record<string, number>> = {
  neutral: {},
  happy: {
    'mouthSmile': 0.7,
    'eyeSquintLeft': 0.3,
    'eyeSquintRight': 0.3,
    'cheekSquintLeft': 0.2,
    'cheekSquintRight': 0.2,
  },
  sad: {
    'mouthFrownLeft': 0.5,
    'mouthFrownRight': 0.5,
    'browInnerUp': 0.4,
    'browDownLeft': 0.2,
    'browDownRight': 0.2,
  },
  concerned: {
    'browInnerUp': 0.6,
    'mouthPucker': 0.2,
    'eyeSquintLeft': 0.1,
    'eyeSquintRight': 0.1,
  },
  surprised: {
    'eyeWideLeft': 0.5,
    'eyeWideRight': 0.5,
    'browOuterUpLeft': 0.4,
    'browOuterUpRight': 0.4,
    'jawOpen': 0.3,
  },
  thinking: {
    'browDownLeft': 0.3,
    'eyeLookUpLeft': 0.2,
    'eyeLookUpRight': 0.2,
    'mouthPucker': 0.15,
  },
};

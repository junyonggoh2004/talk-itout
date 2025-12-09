import { useMemo } from 'react';
import { EmotionType } from '@/utils/visemeMapping';

// Keywords that indicate different emotions
const emotionKeywords: Record<EmotionType, string[]> = {
  happy: [
    'happy', 'glad', 'wonderful', 'great', 'awesome', 'fantastic', 'amazing',
    'excited', 'joy', 'love', 'proud', 'delighted', 'pleased', 'thrilled',
    'celebrate', 'congratulations', 'excellent', 'perfect', 'brilliant',
    'smile', 'laugh', 'fun', 'enjoy', 'cheer',
  ],
  sad: [
    'sad', 'sorry', 'difficult', 'hard', 'tough', 'struggle', 'pain',
    'hurt', 'disappointed', 'regret', 'miss', 'lonely', 'alone',
    'crying', 'tears', 'loss', 'grief', 'heartbreak',
  ],
  concerned: [
    'worried', 'concern', 'anxious', 'stress', 'nervous', 'afraid',
    'fear', 'scary', 'trouble', 'problem', 'issue', 'careful',
    'important', 'serious', 'urgent', 'help', 'support',
    'understand', 'listen', 'here for you',
  ],
  surprised: [
    'wow', 'amazing', 'incredible', 'unbelievable', 'shocking',
    'unexpected', 'really', 'seriously', 'oh my',
  ],
  thinking: [
    'think', 'consider', 'perhaps', 'maybe', 'might', 'could',
    'wonder', 'curious', 'interesting', 'hmm', 'let me',
    'reflect', 'ponder', 'question',
  ],
  neutral: [],
};

export const useEmotionDetection = (text: string): EmotionType => {
  const emotion = useMemo(() => {
    if (!text) return 'neutral';
    
    const lowerText = text.toLowerCase();
    const scores: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      concerned: 0,
      surprised: 0,
      thinking: 0,
      neutral: 0,
    };
    
    // Score each emotion based on keyword matches
    (Object.keys(emotionKeywords) as EmotionType[]).forEach((emotion) => {
      emotionKeywords[emotion].forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          scores[emotion] += 1;
        }
      });
    });
    
    // Find the emotion with highest score
    let maxEmotion: EmotionType = 'neutral';
    let maxScore = 0;
    
    (Object.keys(scores) as EmotionType[]).forEach((emotion) => {
      if (scores[emotion] > maxScore) {
        maxScore = scores[emotion];
        maxEmotion = emotion;
      }
    });
    
    // Default to concerned/empathetic for counselor context if no strong match
    if (maxScore === 0) {
      // Check if it's a question or supportive statement
      if (lowerText.includes('?') || lowerText.includes('how are you') || lowerText.includes('tell me')) {
        return 'concerned';
      }
      return 'neutral';
    }
    
    return maxEmotion;
  }, [text]);
  
  return emotion;
};

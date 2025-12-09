import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { EmotionType } from '@/utils/visemeMapping';

// Lazy load the 3D avatar to avoid blocking initial render
const Avatar3D = lazy(() => import('./Avatar3D'));

interface AvatarContainerProps {
  emotion: EmotionType;
  audioVolume: number;
  isSpeaking: boolean;
  currentText: string;
}

const AvatarLoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/5 to-secondary/20 rounded-2xl">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading avatar...</p>
    </div>
  </div>
);

const AvatarContainer = ({ emotion, audioVolume, isSpeaking, currentText }: AvatarContainerProps) => {
  return (
    <div className="w-full h-48 md:h-64 lg:h-72 relative">
      <Suspense fallback={<AvatarLoadingFallback />}>
        <Avatar3D
          emotion={emotion}
          audioVolume={audioVolume}
          isSpeaking={isSpeaking}
          currentText={currentText}
        />
      </Suspense>
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full border border-border/50">
          <div className="flex gap-0.5">
            <span className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-muted-foreground">Speaking...</span>
        </div>
      )}
    </div>
  );
};

export default AvatarContainer;

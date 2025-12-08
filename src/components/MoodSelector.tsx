import { cn } from "@/lib/utils";

type Mood = "very_bad" | "bad" | "okay" | "good" | "great";

interface MoodOption {
  value: Mood;
  label: string;
  emoji: string;
}

const moodOptions: MoodOption[] = [
  { value: "very_bad", label: "Very Bad", emoji: "😢" },
  { value: "bad", label: "Bad", emoji: "😔" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "great", label: "Great", emoji: "😄" },
];

interface MoodSelectorProps {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
}

const MoodSelector = ({ selected, onSelect }: MoodSelectorProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
      {moodOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={cn(
            "mood-card flex flex-col items-center gap-2 min-w-[80px] md:min-w-[100px]",
            "hover:scale-105 active:scale-95 transition-transform duration-150",
            selected === option.value && "mood-card-selected scale-105"
          )}
        >
          <span className="text-4xl md:text-5xl" role="img" aria-label={option.label}>
            {option.emoji}
          </span>
          <span className="text-sm font-medium text-foreground/80">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;
export type { Mood };

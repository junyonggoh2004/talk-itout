import { useState } from "react";
import { Wind, Hand, PenLine, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  title: string;
  emoji: string;
  icon: typeof Wind;
  description: string;
  steps: string[];
}

const activities: Activity[] = [
  {
    id: "breathing",
    title: "Box Breathing (4-4-4-4)",
    emoji: "🧘",
    icon: Wind,
    description: "A calming breathing technique used by Navy SEALs to reduce stress and improve focus.",
    steps: [
      "Breathe in slowly for 4 seconds",
      "Hold your breath for 4 seconds",
      "Exhale slowly for 4 seconds",
      "Hold empty for 4 seconds",
      "Repeat 4-6 times or until you feel calm",
    ],
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 Grounding",
    emoji: "✋",
    icon: Hand,
    description: "A grounding technique to bring you back to the present moment when feeling anxious.",
    steps: [
      "Name 5 things you can SEE around you",
      "Name 4 things you can TOUCH or feel",
      "Name 3 things you can HEAR",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE",
    ],
  },
  {
    id: "thought",
    title: "Capture a Thought",
    emoji: "📝",
    icon: PenLine,
    description: "Write down a thought that's bothering you to help process and release it.",
    steps: [
      "Take a deep breath and close your eyes",
      "Identify one thought that's on your mind",
      "Write it down without judgment",
      "Ask: Is this thought helpful? Is it true?",
      "Let go of the thought and move forward",
    ],
  },
];

const QuickActivity = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  return (
    <>
      <div className="space-y-3">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setSelectedActivity(activity)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl bg-card",
              "border border-border/50 hover:border-primary/30",
              "hover:shadow-soft transition-all duration-200",
              "text-left group"
            )}
          >
            <span className="text-xl">{activity.emoji}</span>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {activity.title}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span>{selectedActivity?.emoji}</span>
              {selectedActivity?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              {selectedActivity?.description}
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Steps:</h4>
              <ol className="space-y-2">
                {selectedActivity?.steps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-foreground/80"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActivity;

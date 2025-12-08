import { useState } from "react";
import { Heart, Check } from "lucide-react";
import Header from "@/components/Header";
import MoodSelector, { Mood } from "@/components/MoodSelector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MoodPage = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [thoughts, setThoughts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Let us know how you're feeling today.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Only persist to database if user is logged in
    if (user) {
      const { error } = await supabase.from("mood_checkins").insert({
        user_id: user.id,
        mood: selectedMood,
        thoughts: thoughts.trim() || null,
      });

      if (error) {
        console.error("Error saving mood check-in:", error);
        toast({
          title: "Error saving check-in",
          description: "Please try again later.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    toast({
      title: "Thank you for sharing",
      description: "Remember, it's okay to feel however you're feeling right now.",
    });

    // Reset form
    setSelectedMood(null);
    setThoughts("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              How are you feeling?
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Taking a moment to check in with yourself is important. I'm here to listen.
          </p>
        </div>

        {/* Check-in card */}
        <div className="card-elevated p-6 md:p-8 animate-slide-up">
          {/* Mood selector */}
          <div className="mb-8">
            <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
          </div>

          {/* Thoughts textarea */}
          <div className="space-y-2 mb-6">
            <label
              htmlFor="thoughts"
              className="text-sm font-medium text-foreground"
            >
              What's on your mind? (optional)
            </label>
            <Textarea
              id="thoughts"
              placeholder="Share anything you'd like... I'm here to listen."
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              rows={4}
              className="resize-none bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-6 text-lg font-semibold rounded-xl shadow-soft hover:shadow-hover transition-all"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save Check-in
              </>
            )}
          </Button>
        </div>

        {/* Crisis disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-md mx-auto">
          This is not a crisis service. If you're in immediate danger, please contact emergency services or a helpline like{" "}
          <a href="tel:1800-221-4444" className="text-primary underline">
            Samaritans of Singapore (1800-221-4444)
          </a>.
        </p>
      </main>
    </div>
  );
};

export default MoodPage;

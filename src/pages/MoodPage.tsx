import { useState, useEffect } from "react";
import { Heart, Check, Calendar } from "lucide-react";
import Header from "@/components/Header";
import MoodSelector, { Mood } from "@/components/MoodSelector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
interface MoodCheckin {
  id: string;
  mood: string;
  thoughts: string | null;
  created_at: string;
}
const moodLabels: Record<string, string> = {
  very_bad: "Very Bad",
  bad: "Bad",
  okay: "Okay",
  good: "Good",
  great: "Great"
};

// Test user email that can have unlimited check-ins
const TEST_USER_EMAIL = "student-test@gmail.com";
const MoodPage = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [thoughts, setThoughts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkins, setCheckins] = useState<MoodCheckin[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  useEffect(() => {
    if (user) {
      fetchCheckins();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  const fetchCheckins = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("mood_checkins").select("*").eq("user_id", user.id).order("created_at", {
      ascending: false
    });
    if (error) {
      console.error("Error fetching check-ins:", error);
    } else {
      setCheckins(data || []);

      // Check if user has already checked in today
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Skip daily limit check for test user
      const isTestUser = user?.email === TEST_USER_EMAIL;
      const todayCheckin = (data || []).find(c => {
        const checkinDate = new Date(c.created_at);
        return checkinDate >= new Date(todayStart) && checkinDate <= new Date(todayEnd);
      });
      setHasCheckedInToday(!isTestUser && !!todayCheckin);
    }
    setIsLoading(false);
  };
  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Let us know how you're feeling today.",
        variant: "destructive"
      });
      return;
    }
    if (user && hasCheckedInToday) {
      toast({
        title: "Already checked in today",
        description: "You can only check in once per day. Come back tomorrow!",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);

    // Only persist to database if user is logged in
    if (user) {
      const {
        error
      } = await supabase.from("mood_checkins").insert({
        user_id: user.id,
        mood: selectedMood,
        thoughts: thoughts.trim() || null
      });
      if (error) {
        console.error("Error saving mood check-in:", error);
        toast({
          title: "Error saving check-in",
          description: "Please try again later.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Refresh check-ins list
      await fetchCheckins();
    }
    toast({
      title: "Thank you for sharing",
      description: "Remember, it's okay to feel however you're feeling right now."
    });

    // Reset form
    setSelectedMood(null);
    setThoughts("");
    setIsSubmitting(false);
  };
  return <div className="min-h-screen bg-background">
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
          <p className="text-muted-foreground max-w-md mx-auto">Taking a moment to check in with yourself is important. </p>
        </div>

        {/* Check-in card */}
        <div className="card-elevated p-6 md:p-8 animate-slide-up">
          {!user ? <div className="text-center py-6">
              <Heart className="w-12 h-12 text-pink-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Log in to track your mood and see your check-in history. </h3>
              
              <Button asChild>
                <a href="/login">Log In</a>
              </Button>
            </div> : hasCheckedInToday ? <div className="text-center py-6">
              <Check className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                You've already checked in today
              </h3>
              <p className="text-muted-foreground">
                Come back tomorrow to log how you're feeling.
              </p>
            </div> : <>
              {/* Mood selector */}
              <div className="mb-8">
                <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
              </div>

              {/* Thoughts textarea */}
              <div className="space-y-2 mb-6">
                <label htmlFor="thoughts" className="text-sm font-medium text-foreground">
                  What's on your mind? (optional)
                </label>
                <Textarea id="thoughts" placeholder="Share anything you'd like... I'm here to listen." value={thoughts} onChange={e => setThoughts(e.target.value)} rows={4} className="resize-none bg-secondary/50 border-border/50 focus:border-primary/50" />
              </div>

              {/* Submit button */}
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-6 text-lg font-semibold rounded-xl shadow-soft hover:shadow-hover transition-all">
                {isSubmitting ? <span className="animate-pulse">Saving...</span> : <>
                    <Check className="w-5 h-5 mr-2" />
                    Save Check-in
                  </>}
              </Button>
            </>}
        </div>

        {/* Check-in history for logged-in users */}
        {user && <div className="card-elevated p-6 md:p-8 mt-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-display font-bold text-foreground">
                Your Check-in History
              </h2>
            </div>

            {isLoading ? <p className="text-muted-foreground text-center py-6 animate-pulse">
                Loading...
              </p> : checkins.length > 0 ? <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Mood</TableHead>
                      <TableHead>Thoughts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkins.map(checkin => <TableRow key={checkin.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(checkin.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${checkin.mood === "great" ? "bg-green-100 text-green-700" : checkin.mood === "good" ? "bg-emerald-100 text-emerald-700" : checkin.mood === "okay" ? "bg-yellow-100 text-yellow-700" : checkin.mood === "bad" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                            {moodLabels[checkin.mood] || checkin.mood}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {checkin.thoughts || "-"}
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div> : <p className="text-muted-foreground text-center py-6">
                No check-ins yet. Start by logging how you feel today!
              </p>}
          </div>}

        {/* Crisis disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-md mx-auto">
          This is not a crisis service. If you're in immediate danger, please approach a trusted adult or contact emergency services.
        </p>
      </main>
    </div>;
};
export default MoodPage;
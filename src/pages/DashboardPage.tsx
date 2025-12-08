import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Clock } from "lucide-react";
import Header from "@/components/Header";
import AlertCard from "@/components/AlertCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface RiskFlag {
  id: string;
  user_id: string;
  severity: string;
  risk_type: string;
  channel: string;
  message: string;
  status: string;
  created_at: string;
  checkin_id: string | null;
  mood?: string;
  display_name?: string;
}

interface DashboardStats {
  totalStudents: number;
  activeWeek: number;
  avgMood: number;
  openFlags: number;
}

const moodToNumber: Record<string, number> = {
  very_bad: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
};

const DashboardPage = () => {
  const [alerts, setAlerts] = useState<RiskFlag[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeWeek: 0,
    avgMood: 0,
    openFlags: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    // Fetch open risk flags
    const { data: flagsData, error: flagsError } = await supabase
      .from("risk_flags")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (flagsError) {
      console.error("Error fetching risk flags:", flagsError);
    } else {
      // Enrich flags with mood and display name
      const enrichedFlags = await Promise.all(
        (flagsData || []).map(async (flag) => {
          let mood = "";
          let displayName = "";

          // Fetch mood from checkin if available
          if (flag.checkin_id) {
            const { data: checkinData } = await supabase
              .from("mood_checkins")
              .select("mood")
              .eq("id", flag.checkin_id)
              .maybeSingle();
            mood = checkinData?.mood || "";
          }

          // Fetch display name from profiles
          const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", flag.user_id)
            .maybeSingle();
          displayName = profileData?.display_name || "";

          return { ...flag, mood, display_name: displayName };
        })
      );

      setAlerts(enrichedFlags);
    }

    // Fetch stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get total unique students (users with student role who have check-ins)
    const { data: studentsData } = await supabase
      .from("mood_checkins")
      .select("user_id");

    const uniqueStudents = new Set(studentsData?.map((c) => c.user_id) || []);

    // Get active students in last 7 days
    const { data: activeData } = await supabase
      .from("mood_checkins")
      .select("user_id")
      .gte("created_at", sevenDaysAgo.toISOString());

    const activeStudents = new Set(activeData?.map((c) => c.user_id) || []);

    // Get average mood from all check-ins
    const { data: moodData } = await supabase
      .from("mood_checkins")
      .select("mood");

    let avgMood = 0;
    if (moodData && moodData.length > 0) {
      const totalMood = moodData.reduce(
        (sum, c) => sum + (moodToNumber[c.mood] || 3),
        0
      );
      avgMood = totalMood / moodData.length;
    }

    setStats({
      totalStudents: uniqueStudents.size,
      activeWeek: activeStudents.size,
      avgMood: avgMood,
      openFlags: flagsData?.length || 0,
    });

    setIsLoading(false);
  };

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    const { error } = await supabase
      .from("risk_flags")
      .update({
        status: newStatus,
        resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", alertId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update alert status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Alert marked as ${newStatus === "resolved" ? "resolved" : "pending"}.`,
      });
      fetchDashboardData();
    }
  };

  const moodLabels: Record<string, string> = {
    very_bad: "Very Bad",
    bad: "Bad",
    okay: "Okay",
    good: "Good",
    great: "Great",
  };

  const formatAlertForCard = (flag: RiskFlag) => ({
    id: flag.id,
    severity: flag.severity as "low" | "medium" | "high" | "critical",
    riskType: flag.risk_type,
    channel: flag.channel,
    message: flag.message,
    userAlias: flag.display_name || `Student ${flag.user_id.substring(0, 8)}`,
    mood: flag.mood ? moodLabels[flag.mood] || flag.mood : undefined,
    timestamp: format(new Date(flag.created_at), "MMM d, yyyy, h:mm a"),
    status: flag.status,
    userId: flag.user_id,
  });

  return (
    <div className="min-h-screen bg-secondary/50">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="w-8 h-8 text-destructive" />
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Counsellor Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Monitor and respond to high-risk users
            </p>
          </div>

          {/* Pending alerts badge */}
          <div className="card-elevated p-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : alerts.length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-up">
          <div className="card-elevated p-5">
            <p className="text-3xl font-bold text-foreground mb-1">
              {isLoading ? "..." : stats.totalStudents}
            </p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
          <div className="card-elevated p-5">
            <p className="text-3xl font-bold text-foreground mb-1">
              {isLoading ? "..." : stats.activeWeek}
            </p>
            <p className="text-sm text-muted-foreground">Active (7 days)</p>
          </div>
          <div className="card-elevated p-5">
            <p className="text-3xl font-bold text-foreground mb-1">
              {isLoading ? "..." : stats.avgMood > 0 ? stats.avgMood.toFixed(1) : "-"}
            </p>
            <p className="text-sm text-muted-foreground">Avg Mood</p>
          </div>
          <div className="card-elevated p-5">
            <p className="text-3xl font-bold text-destructive mb-1">
              {isLoading ? "..." : stats.openFlags}
            </p>
            <p className="text-sm text-muted-foreground">Open Risk Flags</p>
          </div>
        </div>

        {/* Critical alert banner */}
        {criticalCount > 0 && (
          <div className="bg-destructive rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-6 h-6 text-destructive-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive-foreground">
                {criticalCount} user{criticalCount > 1 ? "s" : ""} require
                {criticalCount === 1 ? "s" : ""} immediate attention
              </p>
              <p className="text-sm text-destructive-foreground/80">
                Please review and acknowledge these alerts as soon as possible.
              </p>
            </div>
          </div>
        )}

        {/* Risk Flags section */}
        <section className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-display font-bold text-foreground">
              {alerts.length > 0
                ? `Pending Alerts (${alerts.length})`
                : "Risk Flags - Requires Attention"}
            </h2>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground animate-pulse">Loading...</p>
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={formatAlertForCard(alert)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No open risk flags</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;

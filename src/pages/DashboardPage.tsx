import { useState } from "react";
import { Shield, AlertTriangle, Clock, Users, TrendingUp, Heart } from "lucide-react";
import Header from "@/components/Header";
import AlertCard, { Alert } from "@/components/AlertCard";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockAlerts: Alert[] = [
  {
    id: "1",
    severity: "critical",
    riskType: "Suicide Risk",
    channel: "chat",
    message: "I want to kill myself",
    userAlias: "anon_17629615200...",
    timestamp: "Nov 12, 2025, 3:32 PM",
  },
  {
    id: "2",
    severity: "critical",
    riskType: "Suicide Risk",
    channel: "chat",
    message: "I want to kill myself",
    userAlias: "anon_17629317190...",
    timestamp: "Nov 12, 2025, 7:16 AM",
  },
  {
    id: "3",
    severity: "high",
    riskType: "Self-Harm",
    channel: "mood",
    message: "I feel like hurting myself, nothing seems to help anymore",
    userAlias: "anon_17628991827...",
    timestamp: "Nov 11, 2025, 11:45 PM",
  },
];

const mockStats = {
  totalStudents: 5,
  activeWeek: 4,
  avgMood: 3.8,
  openFlags: 3,
};

const DashboardPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const { toast } = useToast();

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  const handleReview = (alertId: string) => {
    toast({
      title: "Opening review...",
      description: "Alert details would open in a modal or new page.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="counselor" />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
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
              <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          {[
            { label: "Total Students", value: mockStats.totalStudents, icon: Users },
            { label: "Active (7 days)", value: mockStats.activeWeek, icon: TrendingUp },
            { label: "Avg Mood", value: mockStats.avgMood.toFixed(1), icon: Heart },
            { label: "Open Risk Flags", value: mockStats.openFlags, icon: AlertTriangle, highlight: true },
          ].map((stat) => (
            <div key={stat.label} className="card-elevated p-4">
              <p className={`text-2xl font-bold ${stat.highlight ? "text-destructive" : "text-foreground"}`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Critical alert banner */}
        {criticalCount > 0 && (
          <div className="bg-destructive rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-6 h-6 text-destructive-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive-foreground">
                {criticalCount} user{criticalCount > 1 ? "s" : ""} require{criticalCount === 1 ? "s" : ""} immediate attention
              </p>
              <p className="text-sm text-destructive-foreground/80">
                Please review and acknowledge these alerts as soon as possible.
              </p>
            </div>
          </div>
        )}

        {/* Alerts section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-display font-bold text-foreground">
              Pending Alerts ({alerts.length})
            </h2>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onReview={handleReview} />
              ))}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center">
              <p className="text-muted-foreground">No open risk flags</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;

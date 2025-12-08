import { Settings, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import FocusTimer from "@/components/FocusTimer";
import QuickActivity from "@/components/QuickActivity";

const ActivitiesPage = () => {
  const settings = {
    focus: 25,
    break: 5,
    longBreak: 15,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Take a moment for yourself <span className="inline-block">🧘</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            When things feel busy, a little focused time can help. I'll be your timer — you focus on what matters.
          </p>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6 animate-slide-up">
          {/* Timer card - takes 2 columns */}
          <div className="lg:col-span-2 card-elevated p-6 md:p-8">
            <FocusTimer
              focusMinutes={settings.focus}
              breakMinutes={settings.break}
              longBreakMinutes={settings.longBreak}
            />
          </div>

          {/* Side cards */}
          <div className="space-y-6">
            {/* Settings card */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-foreground">
                  Your Settings
                </h2>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Focus:", value: `${settings.focus} min` },
                  { label: "Break:", value: `${settings.break} min` },
                  { label: "Long Break:", value: `${settings.longBreak} min` },
                ].map((setting) => (
                  <div
                    key={setting.label}
                    className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{setting.label}</span>
                    <span className="text-sm font-semibold text-foreground">{setting.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick activities card */}
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-display font-bold text-foreground">
                  Quick Activities
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Take a mindful break
              </p>
              
              <QuickActivity />
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Try the 5-4-3-2-1 grounding exercise if you're feeling overwhelmed.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ActivitiesPage;

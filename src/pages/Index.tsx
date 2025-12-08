import { Heart, MessageCircle, Timer, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Heart,
    title: "Mood Check-in",
    description: "Take a moment to check in with how you're feeling. No judgment, just support.",
    link: "/mood",
    color: "text-pink-500",
  },
  {
    icon: MessageCircle,
    title: "Talk It Out",
    description: "Chat with our friendly AI companion about anything on your mind.",
    link: "/chat",
    color: "text-primary",
  },
  {
    icon: Timer,
    title: "Focus & Activities",
    description: "Use our Pomodoro timer and calming exercises to stay centered.",
    link: "/activities",
    color: "text-accent",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero section */}
        <section className="container max-w-5xl mx-auto px-4 py-12 md:py-20 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              Your safe space to talk
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 leading-tight">
              You're not alone.
              <br />
              <span className="text-primary">Let's talk it out.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A safe, friendly space for students to check in with their feelings, chat with an AI companion, and find moments of calm.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl shadow-soft hover:shadow-hover">
                <Link to="/chat">
                  Start Talking
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
                <Link to="/mood">
                  Quick Check-in
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="container max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group card-elevated p-6 animate-slide-up hover:scale-[1.02] transition-transform"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Counsellor CTA */}
        <section className="container max-w-3xl mx-auto px-4 py-12">
          <div className="card-elevated p-6 md:p-8 text-center bg-gradient-to-br from-card to-secondary/30">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
              Are you a counsellor?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Access your dashboard to monitor student wellbeing and respond to alerts.
            </p>
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container max-w-5xl mx-auto px-4 py-8 border-t border-border/50">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Important:</strong> This is not a crisis service. If you're in immediate danger, please contact emergency services.
            </p>
            <p>
              Singapore helplines:{" "}
              <a href="tel:1800-221-4444" className="text-primary underline">
                Samaritans of Singapore (1800-221-4444)
              </a>
              {" • "}
              <a href="tel:1800-6123-123" className="text-primary underline">
                Institute of Mental Health (1800-6123-123)
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;

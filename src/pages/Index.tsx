import { Heart, MessageCircle, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
const features = [{
  icon: Heart,
  title: "Mood Check-in",
  description: "Take a moment to check in with how you're feeling. No judgment, just support.",
  link: "/mood",
  color: "text-pink-500"
}, {
  icon: MessageCircle,
  title: "Talk It Out",
  description: "Chat with our friendly AI companion about anything on your mind.",
  link: "/chat",
  color: "text-primary"
}];
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero section */}
        <section className="container max-w-5xl mx-auto px-4 py-12 md:py-20 text-center">
          <div className="animate-fade-in">
            
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 leading-tight">
              You're not alone.
              <br />
              <span className="text-primary">Let's talk it out.</span>
            </h1>
            
            

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl shadow-soft hover:shadow-hover">
                <Link to="/chat">
                  Start Talking
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
                
              </Button>
            </div>
          </div>
        </section>

        {/* Features section */}
        

        {/* Counsellor CTA */}
        

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
    </div>;
};
export default Index;
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user, userRole, isLoading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (userRole === "counsellor") {
        navigate("/dashboard");
      } else {
        navigate("/mood");
      }
    }
  }, [user, userRole, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent, mode: "login" | "signup") => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        toast({
          title: "Welcome back!",
          description: "You're now logged in.",
        });
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center shadow-sm">
            <Heart className="w-6 h-6 text-destructive fill-destructive" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">
              Talk.ItOut
            </h1>
            <p className="text-muted-foreground text-xs">One Talk Away</p>
          </div>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Welcome to Talk.ItOut
            </h2>
            <p className="text-muted-foreground">
              Sign in to save your check-ins and chat history
            </p>
          </div>

          <div className="card-elevated p-6 md:p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={(e) => handleSubmit(e, "login")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, "signup")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                    <User className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Continue without signing in →
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to use this service responsibly. This is not a crisis service.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

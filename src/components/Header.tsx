import { Heart, MessageCircle, Timer, LayoutDashboard, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  const studentNavItems = [
    { to: "/mood", label: "Mood", icon: Heart },
    { to: "/chat", label: "Chat", icon: MessageCircle },
    { to: "/activities", label: "Activities", icon: Timer },
  ];

  const counsellorNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const navItems = userRole === "counsellor" ? counsellorNavItems : studentNavItems;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-primary py-3 px-4 md:px-6 shadow-soft">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6 text-destructive fill-destructive" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-primary-foreground font-display font-bold text-lg leading-tight">
              Talk.ItOut
            </h1>
            <p className="text-primary-foreground/70 text-xs">One Talk Away</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-primary-foreground/90 hover:bg-primary-foreground/10"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary-foreground/90 hover:bg-primary-foreground/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-foreground shadow-sm hover:shadow-hover transition-all text-sm font-medium"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

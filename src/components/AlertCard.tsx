import { AlertTriangle, Clock, User, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  riskType: string;
  channel: string;
  message: string;
  userAlias: string;
  timestamp: string;
}

interface AlertCardProps {
  alert: Alert;
  onReview: (id: string) => void;
}

const AlertCard = ({ alert, onReview }: AlertCardProps) => {
  const severityStyles: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-blue-500 text-white",
  };

  const channelIcon = alert.channel === "chat" ? MessageCircle : Heart;
  const ChannelIcon = channelIcon;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border-l-4 p-4 shadow-card animate-fade-in",
        alert.severity === "critical" && "border-l-destructive",
        alert.severity === "high" && "border-l-orange-500",
        alert.severity === "medium" && "border-l-yellow-500",
        alert.severity === "low" && "border-l-blue-500"
      )}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("uppercase text-xs font-bold", severityStyles[alert.severity])}>
              {alert.severity}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {alert.riskType}
            </Badge>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <ChannelIcon className="w-3 h-3" />
              {alert.channel}
            </Badge>
          </div>

          {/* Message snippet */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-foreground/80 italic">"{alert.message}"</p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              User: {alert.userAlias}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {alert.timestamp}
            </span>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={() => onReview(alert.id)}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shrink-0"
        >
          Review Now
        </Button>
      </div>
    </div>
  );
};

export default AlertCard;
export type { Alert };

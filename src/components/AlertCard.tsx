import { useState } from "react";
import { Clock, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AlertDetailsDialog from "./AlertDetailsDialog";
import ApproachChatDialog from "./ApproachChatDialog";
interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  riskType: string;
  channel: string;
  message: string;
  userAlias: string;
  mood?: string;
  timestamp: string;
  status: string;
  userId: string;
}
interface AlertCardProps {
  alert: Alert;
  onStatusChange: (id: string, status: string) => void;
}
const AlertCard = ({
  alert,
  onStatusChange
}: AlertCardProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const severityStyles: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-blue-500 text-white"
  };
  const isPending = alert.status === "open";
  return <>
      <div className={cn("bg-card rounded-xl border-l-4 p-4 shadow-card animate-fade-in", alert.severity === "critical" && "border-l-destructive", alert.severity === "high" && "border-l-orange-500", alert.severity === "medium" && "border-l-yellow-500", alert.severity === "low" && "border-l-blue-500")}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("uppercase text-xs font-bold", severityStyles[alert.severity])}>
                {alert.severity}
              </Badge>
              
            </div>

            {/* Message snippet */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-foreground/80 italic">
                "{alert.message}"
              </p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {alert.userAlias}
              </span>
              {alert.mood && <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Mood: {alert.mood}
                </span>}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {alert.timestamp}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button onClick={() => setDetailsOpen(true)} variant="outline" className="w-full">
              Details
            </Button>
            {isPending && <Button onClick={() => setChatOpen(true)} className="w-full">
                Approach
              </Button>}
          </div>
        </div>
      </div>

      <AlertDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} alert={alert} onStatusChange={onStatusChange} />

      <ApproachChatDialog open={chatOpen} onOpenChange={setChatOpen} studentName={alert.userAlias} studentId={alert.userId} />
    </>;
};
export default AlertCard;
export type { Alert };
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
interface AlertDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: {
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
  };
  onStatusChange: (id: string, status: string) => void;
}
const AlertDetailsDialog = ({
  open,
  onOpenChange,
  alert,
  onStatusChange
}: AlertDetailsDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState(alert.status);
  const severityStyles: Record<string, string> = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-blue-500 text-white"
  };
  const statusStyles: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800",
    pending: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800"
  };
  const handleSave = () => {
    onStatusChange(alert.id, selectedStatus);
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Alert Details
          </DialogTitle>
          <DialogDescription>
            Review and manage this risk alert
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            
            
            
          </div>

          {/* User Message */}
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-destructive/50">
            <p className="text-sm font-medium text-muted-foreground mb-1">User Message:</p>
            <p className="text-sm text-foreground italic">"{alert.message}"</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Student Name</p>
              <p className="font-medium text-foreground">{alert.userAlias}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium text-foreground">{alert.channel}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium text-foreground">{alert.timestamp}</p>
            </div>
            {alert.mood && <div>
                <p className="text-muted-foreground">Mood</p>
                <p className="font-medium text-foreground">{alert.mood}</p>
              </div>}
          </div>

          {/* Update Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Update Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default AlertDetailsDialog;
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FocusTimerProps {
  focusMinutes?: number;
  breakMinutes?: number;
  longBreakMinutes?: number;
  cycles?: number;
}

type TimerMode = "focus" | "break" | "longBreak";

const FocusTimer = ({
  focusMinutes = 25,
  breakMinutes = 5,
  longBreakMinutes = 15,
  cycles = 4,
}: FocusTimerProps) => {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  const getModeDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case "focus":
        return focusMinutes * 60;
      case "break":
        return breakMinutes * 60;
      case "longBreak":
        return longBreakMinutes * 60;
    }
  }, [focusMinutes, breakMinutes, longBreakMinutes]);

  const totalTime = getModeDuration(mode);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer completed
      setIsRunning(false);
      
      if (mode === "focus") {
        if (currentCycle >= cycles) {
          // All cycles complete - long break
          setMode("longBreak");
          setTimeLeft(longBreakMinutes * 60);
          setCurrentCycle(1);
        } else {
          // Regular break
          setMode("break");
          setTimeLeft(breakMinutes * 60);
        }
      } else {
        // Break over - start new focus
        if (mode === "break") {
          setCurrentCycle((prev) => prev + 1);
        }
        setMode("focus");
        setTimeLeft(focusMinutes * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, currentCycle, cycles, focusMinutes, breakMinutes, longBreakMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode("focus");
    setCurrentCycle(1);
    setTimeLeft(focusMinutes * 60);
  };

  const getModeLabel = () => {
    switch (mode) {
      case "focus":
        return "Focus Time";
      case "break":
        return "Break Time";
      case "longBreak":
        return "Long Break";
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Target className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-display font-bold text-foreground">
            {getModeLabel()}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Cycle {currentCycle} of {cycles}
        </p>
      </div>

      {/* Timer circle */}
      <div className="relative">
        <div className="timer-circle w-56 h-56 md:w-64 md:h-64 shadow-soft">
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
          
          {/* Time display */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-5xl md:text-6xl font-display font-bold text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="rounded-full"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "px-8 py-6 rounded-full text-lg font-semibold shadow-soft",
            "hover:shadow-hover transition-all"
          )}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              {timeLeft === getModeDuration(mode) ? "Start Focus Session" : "Resume"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FocusTimer;

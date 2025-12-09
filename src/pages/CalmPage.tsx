import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type BreathPhase = "inhale" | "hold" | "exhale";

const CalmPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [isActive, setIsActive] = useState(true);
  const [countdown, setCountdown] = useState(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 4,
  };

  const phaseLabels = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
  };

  // Handle countdown timer
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Reset countdown when phase changes
    setCountdown(phaseDurations[phase]);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhase((currentPhase) => {
            if (currentPhase === "inhale") return "hold";
            if (currentPhase === "hold") return "exhale";
            return "inhale";
          });
          return phaseDurations[phase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, isActive]);

  const getCircleSize = () => {
    switch (phase) {
      case "inhale":
        return "scale-100";
      case "hold":
        return "scale-100";
      case "exhale":
        return "scale-75";
      default:
        return "scale-75";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-blue-600 hover:bg-blue-200/50"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-16 z-10">
        Relax Zone
      </h1>

      {/* Breathing circle container */}
      <div className="relative flex items-center justify-center mb-16">
        {/* Outer glow */}
        <div
          className={`absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-blue-300/30 blur-3xl transition-transform duration-1000 ${getCircleSize()}`}
        />
        
        {/* Main breathing circle */}
        <div
          className={`w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 shadow-2xl shadow-blue-300/50 flex flex-col items-center justify-center transition-transform ease-in-out duration-1000 ${getCircleSize()}`}
        >
          {/* Phase label */}
          <span className="text-xl md:text-2xl font-semibold text-blue-800">
            {phaseLabels[phase]}
          </span>
          {/* Countdown timer */}
          <span className="text-4xl md:text-5xl font-bold text-blue-900 mt-2">
            {countdown}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-blue-500 text-center px-8 max-w-sm z-10">
        Follow the circle. Breathe at your own pace.
      </p>

      {/* Pause/Resume button */}
      <Button
        variant="outline"
        onClick={() => setIsActive(!isActive)}
        className="mt-8 border-blue-300 text-blue-600 hover:bg-blue-100"
      >
        {isActive ? "Pause" : "Resume"}
      </Button>
    </div>
  );
};

export default CalmPage;

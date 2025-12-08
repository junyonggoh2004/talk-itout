import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, Mic, MicOff, Trash2, Volume2, VolumeX, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
  isNew?: boolean;
}

const quickMoods = [
  { emoji: "😊", label: "Pretty good" },
  { emoji: "😐", label: "Okay, I guess" },
  { emoji: "😔", label: "Not great" },
  { emoji: "🤯", label: "Stressed" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hi there! I'm your friendly AI companion. I'm here to listen and support you. How are you feeling today?",
    sender: "assistant",
    timestamp: "Just now",
  },
];

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedQuickMood, setSelectedQuickMood] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isPlaying, isLoading: isSpeaking } = useTextToSpeech();

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
    toast.success("Voice captured!");
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  const { isRecording, isSupported: isVoiceSupported, toggleRecording } = useVoiceRecording({
    onTranscript: handleVoiceTranscript,
    onError: handleVoiceError,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAIResponse = async (allMessages: Message[]) => {
    setIsTyping(true);
    
    try {
      // Convert messages to the format expected by the API
      const chatHistory = allMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: chatHistory }
      });

      if (error) {
        console.error("Chat error:", error);
        toast.error("Failed to get response. Please try again.");
        setIsTyping(false);
        return;
      }

      const responseText = data?.message || "I'm here to listen. Could you tell me more?";
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: responseText,
          sender: "assistant",
          timestamp: formatTime(),
          isNew: true,
        },
      ]);
      setIsTyping(false);

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speak(responseText);
      }
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: formatTime(),
      isNew: true,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    
    getAIResponse(newMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    stop(); // Stop any playing audio
    setMessages(initialMessages);
    setSelectedQuickMood(null);
  };

  const toggleVoice = () => {
    if (isPlaying) {
      stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleQuickMood = (mood: string) => {
    setSelectedQuickMood(mood);
    const moodMessage: Message = {
      id: Date.now().toString(),
      text: `I'm feeling ${mood.toLowerCase()} today.`,
      sender: "user",
      timestamp: formatTime(),
      isNew: true,
    };
    const newMessages = [...messages, moodMessage];
    setMessages(newMessages);
    getAIResponse(newMessages);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-4 md:py-6 flex flex-col">
        {/* Chat container */}
        <div className="flex-1 card-elevated flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 md:p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  TALK
                </p>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                    Let's Talk
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  I'm here to listen and support you.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleVoice}
                  className="shrink-0"
                  title={voiceEnabled ? "Disable voice" : "Enable voice"}
                >
                  {isSpeaking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : voiceEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearChat}
                  className="shrink-0"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear chat
                </Button>
              </div>
            </div>

            {/* Quick mood selector */}
            {!selectedQuickMood && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-xl animate-fade-in">
                <p className="text-sm font-medium text-foreground mb-3">
                  What's your mood like today?
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickMoods.map((mood) => (
                    <button
                      key={mood.label}
                      onClick={() => handleQuickMood(mood.label)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full",
                        "bg-chat-assistant text-primary-foreground",
                        "hover:opacity-90 transition-opacity",
                        "text-sm font-medium"
                      )}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message.text}
                sender={message.sender}
                timestamp={message.timestamp}
                isNew={message.isNew}
              />
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <div className="chat-bubble-assistant px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-border/50 bg-card">
            <div className="flex items-end gap-2">
              <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="icon"
                className={cn(
                  "shrink-0 rounded-full transition-all",
                  isRecording && "animate-pulse"
                )}
                onClick={toggleRecording}
                disabled={!isVoiceSupported}
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Share what's on your mind..."
                  rows={1}
                  className="resize-none pr-12 min-h-[48px] max-h-32 bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to send, Shift+Enter for a new line
                </p>
              </div>
              
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="shrink-0 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-4 max-w-md mx-auto">
          This AI is not a substitute for professional help. If you're struggling, please reach out to a trusted adult or counselor.
        </p>
      </main>
    </div>
  );
};

export default ChatPage;

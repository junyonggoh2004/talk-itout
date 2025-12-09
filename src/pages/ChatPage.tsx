import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, Mic, MicOff, Trash2, Volume2, VolumeX, Loader2, X } from "lucide-react";
import Header from "@/components/Header";
import ChatBubble from "@/components/ChatBubble";
import AvatarContainer from "@/components/AvatarContainer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { useEmotionDetection } from "@/hooks/useEmotionDetection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
  isNew?: boolean;
}
const quickMoods = [{
  emoji: "😊",
  label: "Pretty good"
}, {
  emoji: "😐",
  label: "Okay, I guess"
}, {
  emoji: "😔",
  label: "Not great"
}, {
  emoji: "🤯",
  label: "Stressed"
}];
const initialMessages: Message[] = [{
  id: "1",
  text: "Hi there, I'm Lumi. This is a safe, private space for you to share whatever is on your mind. Everything you share with me is confidential, unless you or someone else is in immediate danger. How can I support you today?",
  sender: "assistant",
  timestamp: "Just now"
}];
const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedQuickMood, setSelectedQuickMood] = useState<string | null>(null);
  const [quickMoodDismissed, setQuickMoodDismissed] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [lastAssistantMessage, setLastAssistantMessage] = useState(initialMessages[0].text);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    speak,
    stop,
    isPlaying,
    isLoading: isSpeaking,
    currentAudio
  } = useTextToSpeech();

  // Audio analysis for lip sync - pass isPlaying state for simulation
  const {
    volume: audioVolume,
    isSpeaking: isAudioSpeaking
  } = useAudioAnalyzer(currentAudio, isPlaying);

  // Emotion detection from last assistant message
  const emotion = useEmotionDetection(lastAssistantMessage);
  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
    toast.success("Voice captured!");
  }, []);
  const handleVoiceError = useCallback((error: string) => {
    toast.error(error);
  }, []);
  const {
    isRecording,
    isSupported: isVoiceSupported,
    toggleRecording
  } = useVoiceRecording({
    onTranscript: handleVoiceTranscript,
    onError: handleVoiceError
  });
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const formatTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const fetchSuggestions = async (assistantMessage: string, allMessages: Message[]) => {
    setIsLoadingSuggestions(true);
    try {
      const conversationContext = allMessages.slice(-4).map(m => `${m.sender}: ${m.text}`).join(" | ");
      const {
        data,
        error
      } = await supabase.functions.invoke('chat-suggestions', {
        body: {
          lastAssistantMessage: assistantMessage,
          conversationContext
        }
      });
      if (!error && data?.suggestions) {
        setSuggestedReplies(data.suggestions);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  const getAIResponse = async (allMessages: Message[]) => {
    setIsTyping(true);
    setSuggestedReplies([]);
    try {
      const chatHistory = allMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));
      const {
        data,
        error
      } = await supabase.functions.invoke('chat', {
        body: {
          messages: chatHistory
        }
      });
      if (error) {
        console.error("Chat error:", error);
        toast.error("Failed to get response. Please try again.");
        setIsTyping(false);
        return;
      }
      const responseText = data?.message || "I'm here to listen. Could you tell me more?";
      const newMessages = [...allMessages, {
        id: Date.now().toString(),
        text: responseText,
        sender: "assistant" as const,
        timestamp: formatTime(),
        isNew: true
      }];
      setMessages(newMessages);
      setLastAssistantMessage(responseText);
      setIsTyping(false);
      if (voiceEnabled) {
        speak(responseText);
      }
      fetchSuggestions(responseText, newMessages);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsTyping(false);
    }
  };
  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: formatTime(),
      isNew: true
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSuggestedReplies([]);
    getAIResponse(newMessages);
  };
  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleClearChat = () => {
    stop();
    setMessages(initialMessages);
    setSelectedQuickMood(null);
    setSuggestedReplies([]);
    setLastAssistantMessage(initialMessages[0].text);
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
      isNew: true
    };
    const newMessages = [...messages, moodMessage];
    setMessages(newMessages);
    getAIResponse(newMessages);
  };
  return <div className="min-h-screen lg:h-screen bg-background flex flex-col lg:overflow-hidden">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-4 flex flex-col lg:min-h-0">
        {/* Main content grid */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:min-h-0">
          {/* Avatar section - hidden on mobile/tablet, positioned lower */}
          <div className="hidden lg:flex lg:flex-col lg:justify-end lg:w-72 shrink-0 pb-24">
            <div className="card-elevated p-3">
              <AvatarContainer emotion={emotion} audioVolume={audioVolume} isSpeaking={isPlaying || isAudioSpeaking} currentText={lastAssistantMessage} />
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-foreground">Lumi</p>
                <p className="text-xs text-muted-foreground">
                  {isPlaying ? "Speaking..." : emotion !== 'neutral' ? `Feeling ${emotion}` : "Listening"}
                </p>
              </div>
            </div>
          </div>

          {/* Chat container */}
          <div className="flex-1 card-elevated flex flex-col lg:overflow-hidden lg:min-h-0">
            {/* Chat header */}
            <div className="p-4 border-b border-border/50 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                      Let's Talk
                    </h1>
                  </div>
                  
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={toggleVoice} className="shrink-0" title={voiceEnabled ? "Disable voice" : "Enable voice"}>
                    {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleClearChat} className="shrink-0">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear chat
                  </Button>
                </div>
              </div>

              {/* Quick mood selector */}
              {!selectedQuickMood && !quickMoodDismissed && <div className="mt-4 p-4 bg-secondary/50 rounded-xl animate-fade-in relative">
                  <button onClick={() => setQuickMoodDismissed(true)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground" aria-label="Dismiss">
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-sm font-medium text-foreground mb-3">
                    What's your mood like today?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickMoods.map(mood => <button key={mood.label} onClick={() => handleQuickMood(mood.label)} className={cn("flex items-center gap-2 px-4 py-2 rounded-full", "bg-card text-foreground border border-border", "hover:bg-secondary transition-colors", "text-sm font-medium")}>
                        <span>{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </button>)}
                  </div>
                </div>}
            </div>

            {/* Messages area */}
            <div className="flex-1 p-4 space-y-4 max-h-[60vh] lg:max-h-none overflow-y-auto lg:min-h-0">
              {messages.map(message => <ChatBubble key={message.id} message={message.text} sender={message.sender} timestamp={message.timestamp} isNew={message.isNew} />)}
              
              {isTyping && <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                  <div className="chat-bubble-assistant px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{
                    animationDelay: "0ms"
                  }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{
                    animationDelay: "150ms"
                  }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{
                    animationDelay: "300ms"
                  }} />
                    </div>
                  </div>
                </div>}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-border/50 bg-card shrink-0">
              {/* Suggested replies */}
              {suggestedReplies.length > 0 && !isTyping && <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
                  {suggestedReplies.map((suggestion, index) => <button key={index} onClick={() => handleSuggestionClick(suggestion)} className={cn("px-4 py-2 rounded-full", "bg-secondary text-foreground", "hover:bg-secondary/80 transition-colors", "text-sm font-medium", "border border-border/50")}>
                      {suggestion}
                    </button>)}
                </div>}

              {isLoadingSuggestions && <div className="flex gap-2 mb-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-9 w-24 rounded-full bg-secondary/50 animate-pulse" />)}
                </div>}

              <div className="flex items-end gap-2">
                <Button variant={isRecording ? "destructive" : "secondary"} size="icon" className={cn("shrink-0 rounded-full transition-all", isRecording && "animate-pulse")} onClick={toggleRecording} disabled={!isVoiceSupported} title={isRecording ? "Stop recording" : "Start voice input"}>
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1 relative">
                  <Textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Share what's on your mind..." rows={1} className="resize-none pr-12 min-h-[48px] max-h-32 bg-secondary/50" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Press Enter to send, Shift+Enter for a new line
                  </p>
                </div>
                
                <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping} size="icon" className="shrink-0 rounded-full">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-4 max-w-md mx-auto shrink-0">
          This AI is not a substitute for professional help. If you're struggling, please reach out to a trusted adult or counselor.
        </p>
      </main>
    </div>;
};
export default ChatPage;
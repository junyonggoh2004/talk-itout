import { cn } from "@/lib/utils";
interface ChatBubbleProps {
  message: string;
  sender: "user" | "assistant";
  timestamp: string;
  isNew?: boolean;
}
const ChatBubble = ({
  message,
  sender,
  timestamp,
  isNew = false
}: ChatBubbleProps) => {
  const isUser = sender === "user";
  return <div className={cn("flex w-full animate-slide-up", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] md:max-w-[70%]", isUser ? "items-end" : "items-start")}>
        <div className={cn(isUser ? "chat-bubble-user" : "chat-bubble-assistant", "shadow-sm")}>
          <p className={cn("text-sm md:text-base leading-relaxed", isUser ? "text-white" : "text-violet-900")}>
            {message}
          </p>
        </div>
        <div className={cn("flex items-center gap-2 mt-1 px-1", isUser ? "justify-end" : "justify-start")}>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isNew}
          {!isUser}
        </div>
      </div>
    </div>;
};
export default ChatBubble;
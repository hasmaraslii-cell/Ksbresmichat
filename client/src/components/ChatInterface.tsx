import { useRef, useEffect, useState } from "react";
import { useCurrentUser, useMessages, useSendMessage } from "@/hooks/use-ksb";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, X } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const { data: user } = useCurrentUser();
  const { data: messages = [] } = useMessages();
  const { mutate: sendMessage, isPending } = useSendMessage();
  
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if ((!inputText.trim() && !selectedImage) || !user) return;
    
    sendMessage({
      userId: user.id,
      content: inputText,
      parentId: replyingTo?.id || undefined,
      isImage: !!selectedImage,
      imageUrl: selectedImage || undefined,
    });
    
    setInputText("");
    setSelectedImage(null);
    setReplyingTo(null);
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => {
          const isMe = msg.userId === user?.id;
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-end gap-2 max-w-[85%]",
                isMe ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
              onClick={() => setReplyingTo(msg)}
            >
              {!isMe && (
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={msg.sender.avatarUrl} />
                  <AvatarFallback className="bg-muted text-[10px]">
                    {msg.sender.codeName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex flex-col">
                <div
                  className={cn(
                    "p-3 rounded-2xl text-[15px] shadow-sm",
                    isMe 
                      ? "bg-white text-black rounded-br-none" 
                      : "bg-[#1a1a1a] text-white rounded-bl-none"
                  )}
                >
                  {msg.replyTo && (
                    <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/30 text-xs opacity-70">
                      <p className="font-bold mb-0.5">{msg.replyTo.sender.codeName}</p>
                      <p className="truncate">{msg.replyTo.content || "Görsel"}</p>
                    </div>
                  )}

                  {msg.isImage && msg.imageUrl && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <img 
                          src={msg.imageUrl} 
                          alt="Attached" 
                          className="w-full rounded-lg mb-2 cursor-pointer object-cover max-h-60"
                        />
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] bg-black border-none p-0">
                        <img src={msg.imageUrl} alt="Full" className="w-full h-auto" />
                      </DialogContent>
                    </Dialog>
                  )}
                  {msg.content && <p className="leading-snug">{msg.content}</p>}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {msg.createdAt && format(new Date(msg.createdAt), "HH:mm")}
                </span>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-black border-t border-border">
        <AnimatePresence>
          {replyingTo && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-2 p-2 bg-[#1a1a1a] rounded-lg flex items-center justify-between border-l-2 border-white"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Yanıtlanan: {replyingTo.sender.codeName}</p>
                <p className="text-xs text-muted-foreground truncate">{replyingTo.content || "Görsel"}</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {/* Real file picker logic */}}
            className="p-2 text-muted-foreground hover:text-white transition-colors"
          >
            <Paperclip className="w-6 h-6" />
          </button>
          
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl px-4 py-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mesaj yaz..."
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-muted-foreground py-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedImage}
            className="p-2 text-white disabled:opacity-30"
          >
            <Send className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}

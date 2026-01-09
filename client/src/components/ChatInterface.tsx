import { useRef, useEffect, useState } from "react";
import { useCurrentUser, useMessages, useSendMessage } from "@/hooks/use-ksb";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Image as ImageIcon, ShieldAlert, X } from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function ChatInterface() {
  const { data: user } = useCurrentUser();
  const { data: messages = [] } = useMessages();
  const { mutate: sendMessage, isPending } = useSendMessage();
  
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
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
      isImage: !!selectedImage,
      imageUrl: selectedImage || undefined,
      operationNote: selectedImage ? "Görüntü Analizi Gerekiyor" : undefined,
    });
    
    setInputText("");
    setSelectedImage(null);
  };

  // Mock file selection
  const handleFileSelect = () => {
    // In a real app, this would trigger file input
    // Using random tech image for demo
    const randomImg = `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80`; // Cyberpunk tech image
    setSelectedImage(randomImg);
  };

  return (
    <div className="flex flex-col h-full bg-black/90 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => {
          const isMe = msg.userId === user?.id;
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "flex flex-col max-w-[85%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className="flex items-center space-x-2 mb-1 opacity-50 text-[10px] uppercase font-mono tracking-wider">
                {!isMe && <span className="text-primary">{msg.sender.codeName}</span>}
                <span className="text-muted-foreground">
                  {msg.createdAt && format(new Date(msg.createdAt), "HH:mm")}
                </span>
                {isMe && <span className="text-accent">ADMIN</span>}
              </div>

              <div
                className={clsx(
                  "relative p-3 border text-sm font-mono leading-relaxed",
                  isMe 
                    ? "bg-secondary/50 border-primary/20 text-primary rounded-tl-lg rounded-bl-lg rounded-tr-lg" 
                    : "bg-muted/30 border-muted-foreground/20 text-primary/90 rounded-tr-lg rounded-br-lg rounded-tl-lg"
                )}
              >
                {/* Image Content */}
                {msg.isImage && msg.imageUrl && (
                  <div className="mb-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative group cursor-pointer overflow-hidden border border-primary/20">
                          <img 
                            src={msg.imageUrl} 
                            alt="Attached" 
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl bg-black border-primary/50 p-0 overflow-hidden">
                        <img src={msg.imageUrl} alt="Full" className="w-full h-auto" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 border-t border-primary/30">
                          <p className="text-primary font-mono text-xs">[IMG_ID: {msg.id}] :: ANALYSIS_COMPLETE</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {msg.operationNote && (
                      <div className="mt-2 text-[10px] text-accent flex items-center border-l-2 border-accent pl-2">
                        <span className="mr-1">⚠</span> {msg.operationNote}
                      </div>
                    )}
                  </div>
                )}

                {/* Text Content */}
                {msg.content && <p>{msg.content}</p>}

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40 -mt-px -mr-px" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40 -mb-px -ml-px" />
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/95 border-t border-primary/20 backdrop-blur-sm">
        {selectedImage && (
          <div className="mb-2 flex items-center bg-secondary/50 p-2 border border-primary/20 w-fit">
            <ImageIcon className="w-4 h-4 text-primary mr-2" />
            <span className="text-xs text-primary font-mono truncate max-w-[200px]">image_attachment_v1.enc</span>
            <button onClick={() => setSelectedImage(null)} className="ml-2 hover:text-accent">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <button 
            onClick={handleFileSelect}
            className="p-3 bg-secondary hover:bg-secondary/80 border border-primary/20 text-primary transition-colors flex-shrink-0 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
            <Paperclip className="w-5 h-5 relative z-10" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="MESAJI ŞİFRELE..."
              className="w-full bg-secondary/30 border border-primary/20 text-primary placeholder:text-muted-foreground/50 p-3 pr-10 focus:outline-none focus:border-primary/50 font-mono text-sm resize-none h-[46px] min-h-[46px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-0 bottom-0 w-2 h-2 border-b border-r border-primary/50" />
          </div>

          <button
            onClick={handleSend}
            disabled={isPending || (!inputText && !selectedImage)}
            className="p-3 bg-accent/90 hover:bg-accent border border-accent-foreground/20 text-white shadow-[0_0_10px_rgba(139,0,0,0.5)] disabled:opacity-50 disabled:shadow-none transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

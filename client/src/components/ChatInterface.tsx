import { useRef, useEffect, useState } from "react";
import { useCurrentUser, useMessages, useSendMessage } from "@/hooks/use-ksb";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, X, Trash2, Edit2, Download, ExternalLink, ShieldCheck, Play, Mic, Ban } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function ChatInterface({ targetUser }: { targetUser?: any }) {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use custom query for DM filtering
  const { data: messages = [] } = useMessages(targetUser?.id);
  const { mutate: sendMessage } = useSendMessage();
  
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number, content: string }) => {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
      setEditingMsg(null);
      setInputText("");
    }
  });

  const delMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.messages.list.path] })
  });

  const banMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/users/${id}/ban`, { method: "POST" });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      toast({ title: "Kullanıcı yasaklandı" });
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    }
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const basePayload = { userId: user!.id, receiverId: targetUser?.id || null };
      if (file.type.startsWith('image/')) {
        sendMessage({ ...basePayload, imageUrl: result, isImage: true });
      } else if (file.type.startsWith('video/')) {
        sendMessage({ ...basePayload, videoUrl: result, isVideo: true });
      } else if (file.type.startsWith('audio/')) {
        if (!targetUser) {
          toast({ title: "Hata", description: "Sesli mesaj sadece DM'lerde gönderilebilir", variant: "destructive" });
          return;
        }
        sendMessage({ ...basePayload, audioUrl: result, isAudio: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!inputText.trim() && !editingMsg) return;
    if (editingMsg) {
      updateMutation.mutate({ id: editingMsg.id, content: inputText });
    } else {
      sendMessage({ 
        userId: user!.id, 
        receiverId: targetUser?.id || null,
        content: inputText, 
        parentId: replyingTo?.id 
      });
      setInputText("");
      setReplyingTo(null);
    }
  };

  const downloadMedia = (url: string, type: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ksb_media_${Date.now()}.${type}`;
    link.click();
  };

  const renderMessage = (msg: any) => {
    const isMe = msg.userId === user?.id;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const content = msg.content || "";
    const parts = content.split(urlPattern);

    return (
      <motion.div 
        key={msg.id} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex flex-col gap-1 w-full", isMe ? "items-end" : "items-start")}
      >
        <div className={cn("flex items-end gap-2 max-w-[85%]", isMe ? "flex-row-reverse" : "flex-row")}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={msg.sender.avatarUrl} />
            <AvatarFallback className="text-[10px]">{msg.sender.username.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            {!isMe && (
              <div className="flex items-center gap-1 mb-0.5 px-1">
                <span className="text-[10px] font-bold text-muted-foreground">{msg.sender.displayName || msg.sender.username}</span>
                {msg.sender.isAdmin && <ShieldCheck className="w-3 h-3 text-blue-400" />}
                {user?.isAdmin && (
                  <button onClick={() => banMutation.mutate(msg.userId)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 ml-1">
                    <Ban className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <div className={cn("p-3 rounded-2xl text-[15px] group relative", isMe ? "bg-white text-black rounded-br-none" : "bg-[#1a1a1a] text-white rounded-bl-none")}>
              {msg.replyTo && <div className="mb-2 p-2 bg-black/10 rounded-lg border-l-2 border-white/30 text-xs opacity-70"><p className="font-bold">{msg.replyTo.sender.displayName || msg.replyTo.sender.username}</p><p className="truncate">{msg.replyTo.content || "Medya"}</p></div>}
              {msg.isImage && (
                <div className="relative mb-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <img src={msg.imageUrl} className="w-full rounded-lg cursor-pointer max-h-60 object-cover" />
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] bg-black border-none p-0">
                      <DialogTitle className="sr-only">Görsel Önizleme</DialogTitle>
                      <img src={msg.imageUrl} className="w-full h-auto" />
                    </DialogContent>
                  </Dialog>
                  <button onClick={() => downloadMedia(msg.imageUrl!, 'png')} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Download className="w-3.5 h-3.5" /></button>
                </div>
              )}
              {msg.isVideo && (
                <div className="relative mb-2">
                  <video src={msg.videoUrl} className="w-full rounded-lg max-h-60 object-cover" controls />
                  <button onClick={() => downloadMedia(msg.videoUrl!, 'mp4')} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Download className="w-3.5 h-3.5" /></button>
                </div>
              )}
              {msg.isAudio && (
                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg mb-2">
                  <Mic className="w-4 h-4 text-blue-400" />
                  <audio src={msg.audioUrl} controls className="h-8 max-w-[200px]" />
                </div>
              )}
              <div className="leading-snug break-words max-w-full overflow-hidden">
                {parts.map((part: string, i: number) => {
                  if (part.match(urlPattern)) {
                    return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 break-all">{part}</a>;
                  }
                  return part;
                })}
              </div>
            </div>
            <div className={cn("flex items-center gap-2 mt-1 px-1", isMe ? "justify-end" : "justify-start")}>
              <span className="text-[9px] text-muted-foreground">{format(new Date(msg.createdAt), "HH:mm")}</span>
              {(isMe || user?.isAdmin) && <button onClick={() => delMutation.mutate(msg.id)} className="text-destructive hover:opacity-100 opacity-40"><Trash2 className="w-3 h-3" /></button>}
              {isMe && <button onClick={() => { setEditingMsg(msg); setInputText(msg.content || ""); }} className="text-muted-foreground hover:opacity-100 opacity-40"><Edit2 className="w-3 h-3" /></button>}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {targetUser && (
          <div className="flex flex-col items-center py-8 opacity-50">
            <Avatar className="w-16 h-16 mb-2">
              <AvatarImage src={targetUser.avatarUrl} />
              <AvatarFallback>{targetUser.username.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <p className="font-bold">{targetUser.displayName || targetUser.username}</p>
            <p className="text-xs uppercase tracking-widest">{targetUser.codeName}</p>
            <div className="mt-4 px-4 py-1 bg-white/5 rounded-full border border-white/10 text-[10px]">GÜVENLİ ÖZEL KANAL</div>
          </div>
        )}
        {messages.map(renderMessage)}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-black border-t border-border">
        <AnimatePresence>
          {replyingTo && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="mb-2 p-2 bg-[#1a1a1a] rounded-lg flex items-center justify-between border-l-2 border-white"><div className="min-w-0"><p className="text-[10px] font-bold">Yanıtlanan: {replyingTo.sender.displayName || replyingTo.sender.username}</p><p className="text-xs truncate">{replyingTo.content || "Medya"}</p></div><button onClick={() => setReplyingTo(null)}><X className="w-4 h-4" /></button></motion.div>}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileRef} className="hidden" accept="image/*,video/*,audio/*" onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} className="p-2 text-muted-foreground hover:text-white"><Paperclip className="w-6 h-6" /></button>
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl px-4 py-2"><input value={inputText} onChange={e => setInputText(e.target.value)} placeholder={editingMsg ? "Düzenle..." : "Mesaj yaz..."} className="w-full bg-transparent border-none focus:ring-0 text-white" onKeyDown={e => e.key === "Enter" && handleSend()} /></div>
          <button onClick={handleSend} disabled={!inputText.trim() && !editingMsg} className="p-2 text-white disabled:opacity-30"><Send className="w-6 h-6" /></button>
        </div>
      </div>
    </div>
  );
}

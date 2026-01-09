import { useRef, useEffect, useState } from "react";
import { useCurrentUser, useMessages, useSendMessage } from "@/hooks/use-ksb";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, X, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function ChatInterface() {
  const { data: user } = useCurrentUser();
  const { data: messages = [] } = useMessages();
  const { mutate: sendMessage } = useSendMessage();
  const queryClient = useQueryClient();
  
  const [inputText, setInputText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const delMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.messages.delete.path, { id }), { method: "DELETE" });
      if (!res.ok) throw new Error("Hata");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.messages.list.path] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number, content: string }) => {
      const res = await fetch(buildUrl(api.messages.update.path, { id }), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error("Hata");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
      setEditingMsg(null);
      setInputText("");
    }
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      sendMessage({ userId: user!.id, imageUrl: ev.target?.result as string, isImage: true });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!inputText.trim() || !user) return;
    if (editingMsg) {
      updateMutation.mutate({ id: editingMsg.id, content: inputText });
    } else {
      sendMessage({ userId: user.id, content: inputText, parentId: replyingTo?.id });
      setInputText("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => {
          const isMe = msg.userId === user?.id;
          return (
            <div key={msg.id} className={cn("flex items-end gap-2 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto group")}>
              {!isMe && <Avatar className="w-8 h-8"><AvatarImage src={msg.sender.avatarUrl} /><AvatarFallback className="text-[10px]">{msg.sender.codeName.substring(0, 2)}</AvatarFallback></Avatar>}
              <div className="flex flex-col">
                <div className={cn("p-3 rounded-2xl text-[15px]", isMe ? "bg-white text-black rounded-br-none" : "bg-[#1a1a1a] text-white rounded-bl-none")} onClick={() => setReplyingTo(msg)}>
                  {msg.replyTo && <div className="mb-2 p-2 bg-black/10 rounded-lg border-l-2 border-white/30 text-xs opacity-70"><p className="font-bold">{msg.replyTo.sender.codeName}</p><p className="truncate">{msg.replyTo.content || "Görsel"}</p></div>}
                  {msg.isImage && <Dialog><DialogTrigger asChild><img src={msg.imageUrl} className="w-full rounded-lg mb-2 cursor-pointer max-h-60 object-cover" /></DialogTrigger><DialogContent className="max-w-[95vw] bg-black border-none p-0"><img src={msg.imageUrl} className="w-full h-auto" /></DialogContent></Dialog>}
                  {msg.content && <p className="leading-snug">{msg.content}</p>}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), "HH:mm")}</span>
                  {(isMe || user?.isAdmin) && <button onClick={() => delMutation.mutate(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"><Trash2 className="w-3 h-3" /></button>}
                  {isMe && <button onClick={() => { setEditingMsg(msg); setInputText(msg.content); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"><Edit2 className="w-3 h-3" /></button>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-black border-t border-border">
        {replyingTo && <div className="mb-2 p-2 bg-[#1a1a1a] rounded-lg flex items-center justify-between border-l-2 border-white"><div className="min-w-0"><p className="text-[10px] font-bold uppercase">Yanıtlanan: {replyingTo.sender.codeName}</p><p className="text-xs truncate">{replyingTo.content || "Görsel"}</p></div><button onClick={() => setReplyingTo(null)}><X className="w-4 h-4" /></button></div>}
        {editingMsg && <div className="mb-2 p-2 bg-[#1a1a1a] rounded-lg flex items-center justify-between border-l-2 border-white"><div className="min-w-0"><p className="text-[10px] font-bold uppercase">Düzenlenen:</p><p className="text-xs truncate">{editingMsg.content}</p></div><button onClick={() => { setEditingMsg(null); setInputText(""); }}><X className="w-4 h-4" /></button></div>}
        <div className="flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} className="p-2 text-muted-foreground hover:text-white"><Paperclip className="w-6 h-6" /></button>
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl px-4 py-2"><input value={inputText} onChange={e => setInputText(e.target.value)} placeholder={editingMsg ? "Düzenle..." : "Mesaj yaz..."} className="w-full bg-transparent border-none focus:ring-0 text-white" onKeyDown={e => e.key === "Enter" && handleSend()} /></div>
          <button onClick={handleSend} disabled={!inputText.trim()} className="p-2 text-white disabled:opacity-30"><Send className="w-6 h-6" /></button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { MessageSquare, Users, UserPlus, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function DMView() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: friendsList = [] } = useQuery({
    queryKey: [api.friends.list.path],
    queryFn: async () => {
      const res = await fetch(api.friends.list.path);
      if (!res.ok) throw new Error();
      return res.json();
    }
  });

  const [friendUsername, setFriendUsername] = useState("");

  const addFriendMutation = useMutation({
    mutationFn: async (username: string) => {
      // General user check
      const res = await fetch(api.friends.request.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      if (!res.ok) throw new Error((await res.json()).message || "Hata");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Arkadaşlık isteği gönderildi" });
      queryClient.invalidateQueries({ queryKey: [api.friends.list.path] });
      setFriendUsername("");
    },
    onError: (err: any) => toast({ title: "Hata", description: err.message, variant: "destructive" })
  });

  const acceptMutation = useMutation({
    mutationFn: async (friendId: number) => {
      await fetch(api.friends.accept.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId })
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.friends.list.path] })
  });

  return (
    <div className="flex-1 bg-black flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5" />DİREKT MESAJLAR</h2>
        <div className="flex gap-2">
          <Input 
            placeholder="Kullanıcı adı ile ekle..." 
            value={friendUsername}
            onChange={e => setFriendUsername(e.target.value)}
            className="bg-[#1a1a1a] border-none"
          />
          <button 
            onClick={() => addFriendMutation.mutate(friendUsername)}
            className="bg-white text-black p-2 rounded-lg"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {friendsList.map((f: any) => (
          <div key={f.id} className="flex items-center justify-between p-3 bg-[#111] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={f.avatarUrl} />
                <AvatarFallback>{f.username.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold">{f.username}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{f.friendStatus === 'accepted' ? 'Arkadaş' : 'İstek Bekliyor'}</p>
              </div>
            </div>
            {f.friendStatus === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => acceptMutation.mutate(f.id)} className="p-1.5 bg-green-500/20 text-green-500 rounded-lg"><Check className="w-4 h-4" /></button>
                <button className="p-1.5 bg-red-500/20 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
        {friendsList.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-20">
            <Users className="w-12 h-12 mb-4" />
            <p className="text-sm">Arkadaş listeniz boş</p>
          </div>
        )}
      </div>
      <div className="p-8 text-center"><p className="text-xs text-[#c0c0c0] font-light tracking-[0.3em] uppercase opacity-40">Görünmez Ordunun Bilinmez Askerleri</p></div>
    </div>
  );
}

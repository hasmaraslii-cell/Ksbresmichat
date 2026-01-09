import { useState, useEffect, useRef } from "react";
import { useCurrentUser, useUpdateProfile } from "@/hooks/use-ksb";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Camera, LogOut } from "lucide-react";

export function Settings() {
  const { data: user } = useCurrentUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ username: "", bio: "", avatarUrl: "", fullName: "" });

  useEffect(() => { 
    if (user) setFormData({ 
      username: user.username || "", 
      bio: user.bio || "", 
      avatarUrl: user.avatarUrl || "",
      fullName: (user as any).fullName || ""
    }); 
  }, [user]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, { method: "POST" });
      if (!res.ok) throw new Error("Çıkış hatası");
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData([api.users.me.path], null);
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      window.location.reload();
    }
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(p => ({ ...p, avatarUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile(formData, { 
      onSuccess: () => {
        toast({ title: "Profil güncellendi" });
        queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      } 
    });
  };

  if (!user) return null;

  return (
    <div className="flex-1 bg-black p-6 overflow-y-auto space-y-8 flex flex-col">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-2 border-white/10">
            <AvatarImage src={formData.avatarUrl} />
            <AvatarFallback className="bg-muted text-xl">{formData.username.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <button 
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
        </div>
        <div className="text-center"><h2 className="text-xl font-bold">{formData.username}</h2><p className="text-xs text-muted-foreground uppercase tracking-widest">AKTİF KULLANICI</p></div>
      </div>
      <div className="space-y-4 flex-1">
        <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Tam İsim</label><Input value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} className="bg-[#1a1a1a] border-none rounded-xl h-12" placeholder="Tam isminizi girin" /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Kullanıcı Adı</label><Input value={formData.username} readOnly className="bg-[#1a1a1a] border-none rounded-xl h-12 opacity-50" /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Biyografi</label><Textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} className="bg-[#1a1a1a] border-none rounded-xl h-32" /></div>
        <Button onClick={handleSave} className="w-full bg-white text-black rounded-xl h-12 font-bold uppercase">PROFİLİ KAYDET</Button>
        <Button onClick={() => logoutMutation.mutate()} variant="destructive" className="w-full rounded-xl h-12 font-bold uppercase flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> GÜVENLİ ÇIKIŞ
        </Button>
      </div>
      <div className="pt-8 text-center"><p className="text-xs text-[#c0c0c0] font-light tracking-[0.3em] uppercase opacity-40">Görünmez Ordunun Bilinmez Askerleri</p></div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useCurrentUser, useUpdateUser } from "@/hooks/use-ksb";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { data: user } = useCurrentUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    codeName: "",
    bio: "",
    avatarUrl: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        codeName: user.codeName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || ""
      });
    }
  }, [user]);

  const handleSave = () => {
    // Persist to localStorage as requested
    localStorage.setItem("ksb_profile", JSON.stringify(formData));
    
    // Update API
    updateProfile(formData, {
      onSuccess: () => {
        toast({ title: "Profil güncellendi" });
      }
    });
  };

  if (!user) return null;

  return (
    <div className="flex-1 bg-black p-6 overflow-y-auto space-y-8 flex flex-col">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-24 h-24 border-2 border-white/10">
          <AvatarImage src={formData.avatarUrl} />
          <AvatarFallback className="bg-muted text-xl">{formData.codeName.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-xl font-bold">{formData.codeName}</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{user.rank}</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Kod Adı</label>
          <Input 
            value={formData.codeName} 
            onChange={e => setFormData(p => ({ ...p, codeName: e.target.value }))}
            className="bg-[#1a1a1a] border-none rounded-xl h-12"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Biyografi</label>
          <Textarea 
            value={formData.bio} 
            onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
            className="bg-[#1a1a1a] border-none rounded-xl resize-none h-32"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Profil Fotoğrafı URL</label>
          <Input 
            value={formData.avatarUrl} 
            onChange={e => setFormData(p => ({ ...p, avatarUrl: e.target.value }))}
            className="bg-[#1a1a1a] border-none rounded-xl h-12"
          />
        </div>

        <Button onClick={handleSave} className="w-full bg-white text-black hover:bg-white/90 rounded-xl h-12 font-bold uppercase tracking-widest">
          PROFİLİ KAYDET
        </Button>
      </div>

      <div className="pt-8 pb-4 text-center">
        <p className="text-xs text-[#c0c0c0] font-light tracking-[0.3em] uppercase opacity-40">
          Görünmez Ordunun Bilinmez Askerleri
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/New_Project_[8086C82]_1767973230461.png";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "", codeName: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(isLogin ? api.auth.login.path : api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Hata");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
    },
    onError: (err: Error) => {
      toast({ title: "Başarısız", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-6 space-y-8">
      <img src={logoUrl} className="w-32 h-32 opacity-80" />
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center tracking-widest">{isLogin ? "GİRİŞ YAP" : "KAYIT OL"}</h1>
        <Input placeholder="Kullanıcı Adı" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="bg-[#1a1a1a] border-none h-12" />
        <Input type="password" placeholder="Şifre" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="bg-[#1a1a1a] border-none h-12" />
        {!isLogin && <Input placeholder="Kod Adı" value={form.codeName} onChange={e => setForm(f => ({ ...f, codeName: e.target.value }))} className="bg-[#1a1a1a] border-none h-12" />}
        <Button onClick={() => mutation.mutate(form)} className="w-full h-12 bg-white text-black font-bold uppercase" disabled={mutation.isPending}>
          {isLogin ? "Giriş Yap" : "Kayıt Ol"}
        </Button>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-xs text-muted-foreground uppercase tracking-widest">
          {isLogin ? "Hesabın yok mu? Kaydol" : "Zaten üye misin? Giriş yap"}
        </button>
      </div>
    </div>
  );
}

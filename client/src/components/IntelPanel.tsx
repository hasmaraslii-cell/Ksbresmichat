import { useIntelLinks } from "@/hooks/use-ksb";
import { Terminal, ExternalLink, Activity, ShieldCheck, Database, Radio } from "lucide-react";

export function IntelPanel() {
  const { data: links = [] } = useIntelLinks();

  return (
    <div className="flex-1 bg-black flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border"><h2 className="text-xl font-bold flex items-center gap-2"><Terminal className="w-5 h-5" />BİRLİK OPERASYON MERKEZİ</h2></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Sistem Durumu</p>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-[#111] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg"><ShieldCheck className="w-5 h-5 text-green-500" /></div>
                <div><p className="text-xs font-bold">Güvenlik Protokolü</p><p className="text-[10px] text-muted-foreground">Aktif & Şifreli</p></div>
              </div>
              <div className="text-right"><p className="text-xs font-bold text-green-500">ÇALIŞIYOR</p></div>
            </div>
            <div className="bg-[#111] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Database className="w-5 h-5 text-blue-500" /></div>
                <div><p className="text-xs font-bold">Veri Depolama</p><p className="text-[10px] text-muted-foreground">Dağıtık Düğüm</p></div>
              </div>
              <div className="text-right"><p className="text-xs font-bold text-blue-500">98% DOLU</p></div>
            </div>
            <div className="bg-[#111] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg"><Radio className="w-5 h-5 text-red-500" /></div>
                <div><p className="text-xs font-bold">İstihbarat Akışı</p><p className="text-[10px] text-muted-foreground">Anlık Senkron</p></div>
              </div>
              <div className="text-right flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /><p className="text-xs font-bold text-red-500">CANLI</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Harici İstihbarat Kaynakları</p>
          <div className="grid grid-cols-1 gap-2">
            {links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-[#111] rounded-xl hover:bg-[#1a1a1a] transition-all group border border-white/5 hover:border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-muted-foreground group-hover:text-white transition-colors">{link.code}</div>
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{link.label}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="p-8 text-center bg-gradient-to-t from-black to-transparent"><p className="text-xs text-[#c0c0c0] font-light tracking-[0.3em] uppercase opacity-40">Görünmez Ordunun Bilinmez Askerleri</p></div>
    </div>
  );
}

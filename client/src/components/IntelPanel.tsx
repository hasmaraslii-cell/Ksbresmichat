import { useIntelLinks } from "@/hooks/use-ksb";
import { Terminal, ExternalLink, Activity, Users, ShieldAlert } from "lucide-react";

export function IntelPanel() {
  const { data: links = [] } = useIntelLinks();

  return (
    <div className="flex-1 bg-black flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border"><h2 className="text-xl font-bold flex items-center gap-2"><Terminal className="w-5 h-5" />BİRLİK VERİ MERKEZİ</h2></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5"><div className="flex items-center gap-2 text-green-500 mb-2"><Users className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Aktif Ajanlar</span></div><p className="text-2xl font-bold">124</p></div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5"><div className="flex items-center gap-2 text-accent mb-2"><ShieldAlert className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Tehdit Seviyesi</span></div><p className="text-2xl font-bold text-red-600">KRİTİK</p></div>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Güvenli Bağlantılar</p>
          {links.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-[#1a1a1a] rounded-xl hover:bg-[#222] transition-colors group border border-white/5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold text-muted-foreground tracking-widest mb-1">{link.code}</p><p className="text-white font-medium">{link.label}</p></div><ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white" /></div></a>
          ))}
        </div>
      </div>
      <div className="p-8 text-center"><p className="text-xs text-[#c0c0c0] font-light tracking-[0.3em] uppercase opacity-40">Görünmez Ordunun Bilinmez Askerleri</p></div>
    </div>
  );
}

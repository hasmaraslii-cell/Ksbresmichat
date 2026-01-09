import { useState } from "react";
import { MessageSquare, Settings as SettingsIcon, Users } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { UserProfile } from "./UserProfile";

export function DMView() {
  const [activeChat, setActiveChat] = useState<number | null>(null);

  return (
    <div className="flex-1 bg-black flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          DİREKT MESAJLAR
        </h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-[#111] rounded-full"><Users className="w-12 h-12 text-muted-foreground opacity-20" /></div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Henüz bir DM bulunmuyor</p>
          <p className="text-xs text-muted-foreground">Aktif bir operatör ile güvenli kanal başlatmak için listeyi tara.</p>
        </div>
        <button className="text-[10px] font-bold text-white uppercase tracking-widest border border-white/20 px-4 py-2 rounded-lg hover:bg-white hover:text-black transition-all">
          OPERATÖR ARA
        </button>
      </div>
      <div className="p-8 text-center"><p className="text-xs text-[#c0c0c0] font-light tracking-[0.3em] uppercase opacity-40">Görünmez Ordunun Bilinmez Askerleri</p></div>
    </div>
  );
}

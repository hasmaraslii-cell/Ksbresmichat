import { useIntelLinks } from "@/hooks/use-ksb";
import { Terminal, ExternalLink } from "lucide-react";

export function IntelPanel() {
  const { data: links = [] } = useIntelLinks();

  return (
    <div className="flex-1 bg-black flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          BİRLİK BİLGİSİ
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-[#1a1a1a] rounded-xl hover:bg-[#222] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest mb-1">
                  {link.code}
                </p>
                <p className="text-white font-medium">{link.label}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
            </div>
          </a>
        ))}
      </div>

      <div className="p-8 text-center bg-gradient-to-t from-black to-transparent">
        <p className="text-xs text-[#c0c0c0] font-light tracking-[0.3em] uppercase opacity-40">
          Görünmez Ordunun Bilinmez Askerleri
        </p>
      </div>
    </div>
  );
}

import { useIntelLinks } from "@/hooks/use-ksb";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Shield, ExternalLink, Activity, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export function IntelPanel() {
  const { data: links = [] } = useIntelLinks();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="w-full bg-secondary/80 border-t border-primary/20 p-4 text-center group hover:bg-secondary transition-colors relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10 flex items-center justify-center space-x-2">
            <Shield className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-primary font-display tracking-widest uppercase text-sm font-bold">
              İSTİHBARAT PANELİ
            </span>
            <div className="h-px w-8 bg-accent" />
          </div>
        </button>
      </DrawerTrigger>
      
      <DrawerContent className="bg-black border-t border-primary/30 max-h-[80vh] font-mono">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-primary font-display text-xl flex items-center gap-2">
              <Terminal className="w-5 h-5 text-accent" />
              SİBER İSTİHBARAT AKIŞI
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-accent">
              <Activity className="w-3 h-3 animate-spin" />
              CANLI VERİ
            </div>
          </div>

          <div className="space-y-3">
            {links.map((link, index) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="block group relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-accent transition-colors duration-300" />
                <div className="ml-1 bg-secondary/20 border border-primary/10 p-4 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-primary/50 font-bold tracking-wider mb-1">
                      {link.code}
                    </span>
                    <span className="text-primary group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-primary/30 group-hover:text-accent transition-colors" />
                </div>
              </motion.a>
            ))}
            
            {links.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                [NO_ACTIVE_INTEL_FEEDS]
              </div>
            )}
          </div>
          
          <div className="pt-4 text-center">
            <p className="text-[10px] text-primary/30 uppercase tracking-[0.2em]">
              Gizli Operasyon ve Sohbet Protokolü v2.4
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

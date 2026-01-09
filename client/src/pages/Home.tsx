import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-ksb";
import { UserProfile } from "@/components/UserProfile";
import { ChatInterface } from "@/components/ChatInterface";
import { DMView } from "@/components/DMView";
import { Settings } from "@/components/Settings";
import { Auth } from "@/components/Auth";
import { MessageSquare, Settings as SettingsIcon, Users, ShieldCheck } from "lucide-react";

export default function Home() {
  const { data: user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"chat" | "dm" | "settings">("chat");
  const [targetUser, setTargetUser] = useState<any>(null);

  if (isLoading) return null;
  if (!user) return <Auth />;

  return (
    <div className="h-screen w-full flex flex-col bg-black text-foreground overflow-hidden">
      <div className="flex-1 overflow-hidden relative flex flex-col max-w-md mx-auto w-full">
        <header className="p-4 border-b border-border flex items-center justify-between bg-black/50 backdrop-blur-md z-30">
          <h1 className="text-xs font-black tracking-[0.4em] uppercase opacity-80">
            {activeTab === "chat" ? (targetUser ? "ÖZEL HAT" : "GENEL") : (activeTab === "settings" ? "AYARLAR" : activeTab === "dm" ? "DM" : activeTab.toUpperCase())}
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        </header>

        {activeTab === "chat" && (
          <>
            {!targetUser && <UserProfile />}
            <div className="flex-1 overflow-hidden">
              <ChatInterface targetUser={targetUser} />
            </div>
          </>
        )}
        {activeTab === "dm" && <DMView onStartChat={(friend) => {
          setTargetUser(friend);
          setActiveTab("chat");
        }} />}
        {activeTab === "settings" && <Settings />}
      </div>

      <nav className="shrink-0 bg-[#0a0a0a] border-t border-border flex items-center justify-around pb-safe h-16 max-w-md mx-auto w-full px-6">
        <button 
          onClick={() => { setActiveTab("chat"); setTargetUser(null); }} 
          className={activeTab === "chat" && !targetUser ? "text-white flex flex-col items-center gap-1" : "text-muted-foreground flex flex-col items-center gap-1"}
          data-testid="button-nav-group"
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-tighter">Grup</span>
        </button>
        <button 
          onClick={() => setActiveTab("dm")} 
          className={activeTab === "dm" || targetUser ? "text-white flex flex-col items-center gap-1" : "text-muted-foreground flex flex-col items-center gap-1"}
          data-testid="button-nav-dm"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-tighter">DM</span>
        </button>
        <button 
          onClick={() => setActiveTab("settings")} 
          className={activeTab === "settings" ? "text-white flex flex-col items-center gap-1" : "text-muted-foreground flex flex-col items-center gap-1"}
          data-testid="button-nav-settings"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-tighter">Ayarlar</span>
        </button>
      </nav>
    </div>
  );
}

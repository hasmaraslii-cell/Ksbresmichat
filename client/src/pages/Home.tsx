import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-ksb";
import { UserProfile } from "@/components/UserProfile";
import { ChatInterface } from "@/components/ChatInterface";
import { DMView } from "@/components/DMView";
import { Settings } from "@/components/Settings";
import { Auth } from "@/components/Auth";
import { MessageSquare, Settings as SettingsIcon, Users } from "lucide-react";

export default function Home() {
  const { data: user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"chat" | "dm" | "settings">("chat");

  if (isLoading) return null;
  if (!user) return <Auth />;

  return (
    <div className="h-screen w-full flex flex-col bg-black text-foreground overflow-hidden">
      <div className="flex-1 overflow-hidden relative flex flex-col max-w-md mx-auto w-full">
        <header className="p-4 border-b border-border flex items-center justify-end bg-black/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        </header>

        {activeTab === "chat" && (
          <>
            <UserProfile />
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </>
        )}
        {activeTab === "dm" && <DMView />}
        {activeTab === "settings" && <Settings />}
      </div>

      <nav className="shrink-0 bg-[#0a0a0a] border-t border-border flex items-center justify-around pb-safe h-16 max-w-md mx-auto w-full px-6">
        <button onClick={() => setActiveTab("chat")} className={activeTab === "chat" ? "text-white" : "text-muted-foreground"}>
          <MessageSquare className="w-6 h-6" /><span className="text-[10px] uppercase">Grup</span>
        </button>
        <button onClick={() => setActiveTab("dm")} className={activeTab === "dm" ? "text-white" : "text-muted-foreground"}>
          <Users className="w-6 h-6" /><span className="text-[10px] uppercase">DM</span>
        </button>
        <button onClick={() => setActiveTab("settings")} className={activeTab === "settings" ? "text-white" : "text-muted-foreground"}>
          <SettingsIcon className="w-6 h-6" /><span className="text-[10px] uppercase">Ayarlar</span>
        </button>
      </nav>
    </div>
  );
}

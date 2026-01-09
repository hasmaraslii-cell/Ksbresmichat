import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-ksb";
import { UserProfile } from "@/components/UserProfile";
import { ChatInterface } from "@/components/ChatInterface";
import { IntelPanel } from "@/components/IntelPanel";
import { Settings } from "@/components/Settings";
import { Auth } from "@/components/Auth";
import { MessageSquare, Settings as SettingsIcon, Shield } from "lucide-react";

export default function Home() {
  const { data: user, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"chat" | "settings" | "birlik">("chat");

  if (isLoading) return null;
  if (!user) return <Auth />;

  return (
    <div className="h-screen w-full flex flex-col bg-black text-foreground overflow-hidden">
      <div className="flex-1 overflow-hidden relative flex flex-col max-w-md mx-auto w-full">
        {activeTab === "chat" && (
          <>
            <UserProfile />
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </>
        )}
        {activeTab === "settings" && <Settings />}
        {activeTab === "birlik" && <IntelPanel />}
      </div>

      <nav className="shrink-0 bg-[#0a0a0a] border-t border-border flex items-center justify-around pb-safe h-16 max-w-md mx-auto w-full px-6">
        <button onClick={() => setActiveTab("chat")} className={activeTab === "chat" ? "text-white" : "text-muted-foreground"}>
          <MessageSquare className="w-6 h-6" /><span className="text-[10px] uppercase">Sohbet</span>
        </button>
        <button onClick={() => setActiveTab("birlik")} className={activeTab === "birlik" ? "text-white" : "text-muted-foreground"}>
          <Shield className="w-6 h-6" /><span className="text-[10px] uppercase">Birlik</span>
        </button>
        <button onClick={() => setActiveTab("settings")} className={activeTab === "settings" ? "text-white" : "text-muted-foreground"}>
          <SettingsIcon className="w-6 h-6" /><span className="text-[10px] uppercase">Ayarlar</span>
        </button>
      </nav>
    </div>
  );
}

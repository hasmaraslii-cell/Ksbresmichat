import { useState, useEffect } from "react";
import { UserProfile } from "@/components/UserProfile";
import { ChatInterface } from "@/components/ChatInterface";
import { IntelPanel } from "@/components/IntelPanel";
import { Settings } from "@/components/Settings";
import { MessageSquare, Settings as SettingsIcon, Shield } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "settings" | "birlik">("chat");

  return (
    <div className="h-screen w-full flex flex-col bg-black text-foreground overflow-hidden">
      {/* Main Content Area */}
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

      {/* Modern Bottom Navigation */}
      <nav className="shrink-0 bg-[#0a0a0a] border-t border-border flex items-center justify-around pb-safe h-16 max-w-md mx-auto w-full px-6">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "chat" ? "text-white" : "text-muted-foreground"
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Sohbet</span>
        </button>
        <button
          onClick={() => setActiveTab("birlik")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "birlik" ? "text-white" : "text-muted-foreground"
          }`}
        >
          <Shield className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Birlik</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "settings" ? "text-white" : "text-muted-foreground"
          }`}
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Ayarlar</span>
        </button>
      </nav>
    </div>
  );
}

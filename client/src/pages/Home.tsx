import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { UserProfile } from "@/components/UserProfile";
import { ChatInterface } from "@/components/ChatInterface";
import { IntelPanel } from "@/components/IntelPanel";
import { MatrixRain } from "@/components/MatrixRain";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-black text-primary overflow-hidden relative scanline">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <MatrixRain />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full max-w-md mx-auto w-full border-x border-primary/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black/80 backdrop-blur-sm">
        
        {/* Header */}
        <UserProfile />
        
        {/* Chat Area - Takes remaining space */}
        <div className="flex-1 overflow-hidden relative">
          <ChatInterface />
        </div>
        
        {/* Bottom Intel Panel */}
        <div className="shrink-0 z-20">
          <IntelPanel />
        </div>
      </div>
    </div>
  );
}

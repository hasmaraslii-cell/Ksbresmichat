import { useCurrentUser } from "@/hooks/use-ksb";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Wifi, ShieldCheck } from "lucide-react";

export function UserProfile() {
  const { data: user } = useCurrentUser();

  if (!user) return null;

  return (
    <div className="bg-background/95 backdrop-blur border-b border-primary/20 p-4 pt-8 sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        {/* Avatar with Animated Ring */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite]" />
          <div className="absolute -inset-1 rounded-full border border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-[spin_3s_linear_infinite]" />
          
          <Avatar className="w-14 h-14 border-2 border-black">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="bg-secondary text-primary font-bold font-mono">
              {user.codeName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {user.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-accent">
              <ShieldCheck className="w-3 h-3 text-accent" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-primary tracking-wide">
              {user.codeName}
            </h2>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-sm">
              <Wifi className="w-3 h-3 text-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-green-500 uppercase tracking-wider">
                {user.status}
              </span>
            </div>
          </div>
          
          <div className="flex items-center mt-1 space-x-2">
            <div className="h-1.5 w-1.5 bg-accent rounded-full" />
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              {user.rank}
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative Tech Line */}
      <div className="mt-4 flex items-center space-x-1 opacity-30">
        <div className="h-[2px] w-2 bg-primary" />
        <div className="h-[2px] w-1 bg-primary" />
        <div className="h-[2px] flex-1 bg-primary" />
        <div className="text-[8px] font-mono text-primary">SECURE_CONN_ESTABLISHED</div>
      </div>
    </div>
  );
}

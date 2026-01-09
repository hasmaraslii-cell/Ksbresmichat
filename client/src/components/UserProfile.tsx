import { useCurrentUser } from "@/hooks/use-ksb";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck } from "lucide-react";

export function UserProfile() {
  const { data: user } = useCurrentUser();

  if (!user) return null;

  return (
    <div className="bg-black border-b border-border p-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="bg-muted text-xs">
              {user.username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-sm font-bold tracking-tight">{user.username}</h2>
              {user.isAdmin && <ShieldCheck className="w-3 h-3 text-blue-400" />}
              {user.isBanned && <span className="text-[10px] text-red-500 font-bold ml-1 uppercase">[BANLI]</span>}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AKTİF KULLANICI</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Online</span>
        </div>
      </div>
    </div>
  );
}

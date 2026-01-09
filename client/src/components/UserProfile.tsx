import { useCurrentUser } from "@/hooks/use-ksb";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
              {user.codeName.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-bold tracking-tight">{user.codeName}</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user.rank}</p>
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

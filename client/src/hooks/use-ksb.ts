import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertMessage, type MessageWithUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Types from routes
type UpdateProfileRequest = any; 

// === USER HOOKS ===

export function useCurrentUser() {
  return useQuery({
    queryKey: [api.users.me.path],
    queryFn: async () => {
      const res = await fetch(api.users.me.path);
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.users.me.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: UpdateProfileRequest) => {
      const res = await fetch(api.users.update.path, {
        method: api.users.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.users.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.users.me.path] }),
  });
}

// === MESSAGE HOOKS ===

export function useMessages(targetId?: number) {
  const queryClient = useQueryClient();
  return useQuery<MessageWithUser[]>({
    queryKey: [api.messages.list.path, targetId],
    queryFn: async () => {
      const url = targetId ? `${api.messages.list.path}?targetId=${targetId}` : api.messages.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data: MessageWithUser[] = await res.json();
      
      // Local notification logic
      if (data.length > 0) {
        const lastMsg = data[data.length - 1];
        const lastNotifiedId = localStorage.getItem('lastNotifiedMsgId');
        
        // Use a more robust way to get current user ID
        const currentUserId = (window as any).KSB_USER_ID;
        
        // Only notify if it's a new message and not from the current user
        if (lastNotifiedId !== String(lastMsg.id) && currentUserId && lastMsg.userId !== currentUserId) { 
           if ("Notification" in window && Notification.permission === "granted") {
             new Notification(`Yeni Mesaj: ${lastMsg.sender.username}`, {
               body: lastMsg.content,
               icon: lastMsg.sender.avatarUrl || undefined
             });
             localStorage.setItem('lastNotifiedMsgId', String(lastMsg.id));
           }
        }
      }
      
      return data;
    },
    refetchInterval: 3000, // Slower interval to prevent lag
    staleTime: 1000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertMessage) => {
      console.log("Hooks: Sending message payload:", data);
      const res = await fetch(api.messages.send.path, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to send message");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    },
    onError: (error: Error) => {
      console.error("Hooks: Send message failed:", error);
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi: " + error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${api.messages.delete.path}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number, content: string }) => {
      const res = await fetch(`${api.messages.update.path}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to update message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    },
  });
}

export function useIntelLinks() {
  return useQuery({
    queryKey: [api.intel.list.path],
    queryFn: async () => {
      const res = await fetch(api.intel.list.path);
      if (!res.ok) throw new Error("Failed to fetch intel");
      return api.intel.list.responses[200].parse(await res.json());
    },
  });
}

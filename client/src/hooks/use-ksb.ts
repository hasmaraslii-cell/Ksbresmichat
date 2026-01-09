import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertMessage, type UpdateProfileRequest } from "@shared/routes";

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

export function useMessages() {
  return useQuery({
    queryKey: [api.messages.list.path],
    queryFn: async () => {
      const res = await fetch(api.messages.list.path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    refetchInterval: 3000, // Poll every 3s for new messages (simple real-time)
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMessage) => {
      const validated = api.messages.send.input.parse(data);
      const res = await fetch(api.messages.send.path, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.send.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.messages.list.path] }),
  });
}

// === INTEL HOOKS ===

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

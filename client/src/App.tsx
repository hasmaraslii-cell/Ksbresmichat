import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { useCurrentUser } from "@/hooks/use-ksb";
import { useEffect } from "react";

function NotificationManager() {
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (user && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [user]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationManager />
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;

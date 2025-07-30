import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { initializeAuth, getCurrentUser, isAdmin } from "./lib/auth";
import type { User } from "@shared/schema";

// Pages
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import MemberDashboard from "@/pages/member-dashboard";
import GroupRegistration from "@/pages/group-registration";
import NotFound from "@/pages/not-found";

function Router() {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = (event: CustomEvent) => {
      setUser(event.detail);
    };

    const checkAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    // Check auth on mount
    checkAuth();
    
    // Listen for custom auth state changes
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={user ? (isAdmin() ? AdminDashboard : MemberDashboard) : Landing} />
      <Route path="/register/:link" component={GroupRegistration} />
      
      {/* Protected routes */}
      {user && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/member" component={MemberDashboard} />
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize authentication on app start
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

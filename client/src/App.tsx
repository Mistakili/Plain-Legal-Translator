import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AnalysisPage from "@/pages/analysis";
import PrivacyPolicy from "@/pages/privacy";
import TermsOfService from "@/pages/terms";
import AuthPage from "@/pages/auth";
import OnboardingPage from "@/pages/onboarding";
import LandingPage from "@/pages/landing";
import SignRequestPage from "@/pages/sign-request";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/landing" />;
  }

  if (!user.onboardingCompleted && location !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

function AuthRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    if (!user.onboardingCompleted) {
      return <Redirect to="/onboarding" />;
    }
    return <Redirect to="/" />;
  }

  return <AuthPage />;
}

function LandingRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <LandingPage />;
}

function OnboardingRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/landing" />;
  }

  if (user.onboardingCompleted) {
    return <Redirect to="/" />;
  }

  return <OnboardingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={LandingRoute} />
      <Route path="/auth" component={AuthRoute} />
      <Route path="/onboarding" component={OnboardingRoute} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/sign/:token" component={SignRequestPage} />
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/analysis/:id">
        <ProtectedRoute component={AnalysisPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

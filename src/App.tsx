import { Toaster } from "@/components/ui/toaster";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SupportChat } from "@/components/SupportChat";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HealthMonitor } from "@/components/HealthMonitor";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Lessons from "./pages/Lessons";
import Lesson from "./pages/Lesson";
import Achievements from "./pages/Achievements";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Demo from "./pages/Demo";
import PaymentSuccess from "./pages/PaymentSuccess";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/lesson/:lessonId" element={<Lesson />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SupportChat />
            <HealthMonitor />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

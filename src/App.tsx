import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FontSizeToggle } from "@/components/FontSizeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { I18nProvider } from "@/hooks/useI18n";
import { FontSizeProvider } from "@/hooks/useFontSize";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Welcome from "./pages/Welcome.tsx";
import Auth from "./pages/Auth.tsx";
import CreateAlert from "./pages/CreateAlert.tsx";
import PetDetails from "./pages/PetDetails.tsx";
import MapView from "./pages/MapView.tsx";
import MyAlerts from "./pages/MyAlerts.tsx";
import ChatList from "./pages/ChatList.tsx";
import ChatRoom from "./pages/ChatRoom.tsx";
import Profile from "./pages/Profile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <I18nProvider>
        <FontSizeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
            <FontSizeToggle />
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/criar" element={<CreateAlert />} />
            <Route path="/pet/:id" element={<PetDetails />} />
            <Route path="/chat/:petId/:otherId" element={<ChatRoom />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/mapa" element={<MapView />} />
              <Route path="/meus-alertas" element={<MyAlerts />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
        </FontSizeProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

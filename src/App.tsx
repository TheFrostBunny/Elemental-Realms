import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { SettingsPage } from "./pages/Settings";
import { AudioManagerProvider } from "@/components/Audio/AudioManager";

const queryClient = new QueryClient();

const App = () => {
  return (
    <AudioManagerProvider
      defaultMusicEnabled={true}
      defaultMusicVolume={0.7}
      defaultSfxEnabled={true}
      defaultSfxVolume={0.8}
      defaultBackgroundMusic="1"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AudioManagerProvider>
  );
};

export default App;

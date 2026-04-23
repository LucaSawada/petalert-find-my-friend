import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.c8ffc382b67747a0a2ce4c7f0aee3dac",
  appName: "PetAlert",
  webDir: "dist",
  server: {
    url: "https://c8ffc382-b677-47a0-a2ce-4c7f0aee3dac.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    Geolocation: {
      permissions: ["location"],
    },
    Camera: {
      permissions: ["camera", "photos"],
    },
  },
};

export default config;
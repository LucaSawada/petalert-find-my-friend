import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentLocation } from "@/lib/geo";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

type Pet = Tables<"pets">;

// Ícones customizados (Leaflet não carrega imagens padrão via bundler)
const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative"><span style="position:absolute;inset:-6px;border-radius:9999px;background:hsl(var(--primary)/0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></span><div style="position:relative;height:16px;width:16px;border-radius:9999px;background:hsl(var(--primary));border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const petIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="hsl(var(--destructive))" stroke="white" stroke-width="1.5" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

function Recenter({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom() || 14);
  }, [center, map]);
  return null;
}

const MapView = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("pets")
        .select("*")
        .eq("status", "active")
        .not("latitude", "is", null);
      setPets(data ?? []);
      try {
        const loc = await getCurrentLocation();
        setCenter({ lat: loc.latitude, lng: loc.longitude });
      } catch {
        if (data?.[0]?.latitude) setCenter({ lat: data[0].latitude, lng: data[0].longitude! });
      }
      setLoading(false);
    })();
  }, []);

  const initialCenter: [number, number] = center
    ? [center.lat, center.lng]
    : [-23.55052, -46.633308]; // São Paulo como fallback

  return (
    <>
      <AppHeader title="Mapa de alertas" subtitle="Pinos mostram pets perdidos próximos" />

      <div className="px-5 mb-4">
        <div className="relative aspect-square rounded-2xl border border-border overflow-hidden shadow-card bg-muted">
          {loading && <Skeleton className="absolute inset-0 z-[500]" />}
          <MapContainer
            center={initialCenter}
            zoom={14}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter center={center} />
            {center && (
              <Marker position={[center.lat, center.lng]} icon={userIcon}>
                <Popup>Você está aqui</Popup>
              </Marker>
            )}
            {pets.map((pet) =>
              pet.latitude && pet.longitude ? (
                <Marker key={pet.id} position={[pet.latitude, pet.longitude]} icon={petIcon}>
                  <Popup>
                    <Link to={`/pet/${pet.id}`} className="flex items-center gap-2">
                      {pet.photo_url && (
                        <img src={pet.photo_url} alt="" className="h-10 w-10 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{pet.name}</p>
                        <p className="text-xs">{timeAgo(pet.created_at)}</p>
                      </div>
                    </Link>
                  </Popup>
                </Marker>
              ) : null,
            )}
          </MapContainer>
        </div>

        <Button
          variant="outline"
          className="w-full mt-3 h-12"
          onClick={async () => {
            try {
              const loc = await getCurrentLocation();
              setCenter({ lat: loc.latitude, lng: loc.longitude });
            } catch {/* noop */}
          }}
        >
          <Navigation className="h-4 w-4" /> Centralizar em mim
        </Button>
      </div>

      <div className="px-5 space-y-2">
        <h2 className="font-serif text-lg font-bold mb-2">Alertas ativos</h2>
        {pets.map((pet) => (
          <Link
            key={pet.id}
            to={`/pet/${pet.id}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
            )}
          >
            <img src={pet.photo_url ?? ""} alt="" className="h-14 w-14 rounded-lg object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{pet.name}</p>
              <p className="text-xs text-muted-foreground truncate">{pet.address}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(pet.created_at)}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default MapView;
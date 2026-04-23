import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentLocation } from "@/lib/geo";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

type Pet = Tables<"pets">;

/**
 * Visualização "minimapa" — sem chave de provedor externo.
 * Mostra os pets ativos com pinos posicionados relativamente ao centro do usuário,
 * e oferece lista clicável.
 */
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

  // Distância visual (posição relativa em %, escala fixa ~0.05° = grid)
  const positionFor = (pet: Pet) => {
    if (!center || !pet.latitude || !pet.longitude) return { left: "50%", top: "50%" };
    const dLng = pet.longitude - center.lng;
    const dLat = pet.latitude - center.lat;
    const scale = 800; // amplifier
    const left = Math.max(5, Math.min(95, 50 + dLng * scale));
    const top = Math.max(5, Math.min(95, 50 - dLat * scale));
    return { left: `${left}%`, top: `${top}%` };
  };

  return (
    <>
      <AppHeader title="Mapa de alertas" subtitle="Pinos mostram pets perdidos próximos" />

      <div className="px-5 mb-4">
        <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-secondary to-accent border border-border overflow-hidden shadow-card">
          {/* grid decorativo */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary)/0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {loading && <Skeleton className="absolute inset-2 rounded-xl" />}

          {/* Você */}
          {center && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                <div className="relative h-4 w-4 rounded-full bg-primary border-2 border-background shadow-elegant" />
              </div>
              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary whitespace-nowrap">
                Você
              </span>
            </div>
          )}

          {pets.map((pet) => (
            <Link
              key={pet.id}
              to={`/pet/${pet.id}`}
              className="absolute -translate-x-1/2 -translate-y-full z-10 active:scale-110 transition-transform"
              style={positionFor(pet)}
            >
              <MapPin className="h-7 w-7 text-destructive fill-destructive drop-shadow-md" strokeWidth={1.5} />
            </Link>
          ))}

          {!loading && pets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Nenhum alerta com localização
            </div>
          )}
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
import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

type Pet = Tables<"pets">;

const speciesLabel: Record<string, string> = {
  dog: "Cão",
  cat: "Gato",
  other: "Outro",
};

/**
 * Card padrão do feed.
 * Heurística "visibility & recognition over recall" — informação crucial visível em 1s:
 * foto grande > nome+espécie > localização > tempo > status.
 */
export const PetCard = ({ pet }: { pet: Pet }) => {
  const found = pet.status === "found";
  return (
    <Link
      to={`/pet/${pet.id}`}
      className="block rounded-2xl overflow-hidden bg-card shadow-card border border-border active:scale-[0.99] transition-transform"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {pet.photo_url ? (
          <img
            src={pet.photo_url}
            alt={`Foto de ${pet.name}`}
            loading="lazy"
            className={cn("w-full h-full object-cover", found && "grayscale")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sem foto
          </div>
        )}
        {found && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
            <span className="bg-success text-success-foreground px-4 py-2 rounded-full font-bold text-lg shadow-elegant">
              ✓ ENCONTRADO
            </span>
          </div>
        )}
        {!found && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Procurando
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-2xl font-bold text-foreground leading-tight truncate">
            {pet.name}
          </h3>
          <span className="text-sm text-muted-foreground shrink-0">
            {speciesLabel[pet.species]} {pet.breed ? `· ${pet.breed}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{pet.address || "Localização não informada"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeAgo(pet.created_at)}</span>
        </div>
      </div>
    </Link>
  );
};
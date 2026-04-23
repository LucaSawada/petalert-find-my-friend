import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { PetCard } from "@/components/PetCard";
import { AppHeader } from "@/components/AppHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Pet = Tables<"pets">;
type Filter = "all" | "dog" | "cat" | "other" | "found";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "dog", label: "Cães" },
  { id: "cat", label: "Gatos" },
  { id: "other", label: "Outros" },
  { id: "found", label: "Encontrados" },
];

const Home = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const { toast } = useToast();

  useEffect(() => {
    void fetchPets();
    // Realtime
    const channel = supabase
      .channel("pets-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "pets" }, () => {
        void fetchPets();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const fetchPets = async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: "Erro ao carregar alertas", description: error.message, variant: "destructive" });
    } else {
      setPets(data ?? []);
    }
    setLoading(false);
  };

  const filtered = pets.filter((p) => {
    if (filter === "all") return p.status === "active";
    if (filter === "found") return p.status === "found";
    return p.status === "active" && p.species === filter;
  });

  return (
    <>
      <AppHeader title="Pets perto de você" subtitle="Toque em um card para ver detalhes" />

      <div
        role="tablist"
        aria-label="Filtrar alertas"
        className="px-5 pb-4 flex gap-2 overflow-x-auto scrollbar-none"
      >
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[40px] transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-card text-muted-foreground border border-border",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-4">
        {loading ? (
          <>
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <Skeleton className="aspect-[4/3] rounded-2xl" />
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-serif text-xl mb-2">Nenhum alerta por aqui</p>
            <p className="text-sm">Toque no botão SOS para publicar o primeiro.</p>
          </div>
        ) : (
          filtered.map((pet) => <PetCard key={pet.id} pet={pet} />)
        )}
      </div>
    </>
  );
};

export default Home;
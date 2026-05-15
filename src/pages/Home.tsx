import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { PetCard } from "@/components/PetCard";
import { AppHeader } from "@/components/AppHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";
import type { TranslationKey } from "@/lib/translations";

type Pet = Tables<"pets">;
type Filter = "all" | "dog" | "cat" | "other" | "found";

const filters: { id: Filter; key: TranslationKey }[] = [
  { id: "all", key: "home.filter.all" },
  { id: "dog", key: "home.filter.dog" },
  { id: "cat", key: "home.filter.cat" },
  { id: "other", key: "home.filter.other" },
  { id: "found", key: "home.filter.found" },
];

const Home = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const { toast } = useToast();
  const { t } = useI18n();

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
      <AppHeader title={t("home.title")} subtitle={t("home.subtitle")} />

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
            {t(f.key)}
          </button>
        ))}
      </div>

      <div className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <Skeleton className="aspect-[4/3] rounded-2xl" />
          </>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground md:col-span-2 lg:col-span-3">
            <p className="font-serif text-xl mb-2">{t("home.empty.title")}</p>
            <p className="text-sm">{t("home.empty.desc")}</p>
          </div>
        ) : (
          filtered.map((pet) => <PetCard key={pet.id} pet={pet} />)
        )}
      </div>
    </>
  );
};

export default Home;
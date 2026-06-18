import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { PetCard } from "@/components/PetCard";
import { Skeleton } from "@/components/ui/skeleton";

type Pet = Tables<"pets">;

const MyAlerts = () => {
  const { user, loading: authLoading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPets(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/onboarding" replace />;

  const active = pets.filter((p) => p.status === "active");
  const found = pets.filter((p) => p.status === "found");

  return (
    <>
      <AppHeader title="Meus alertas" subtitle="Acompanhe e gerencie seus casos" />
      <div className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <Skeleton className="aspect-[4/3] rounded-2xl" />
        ) : pets.length === 0 ? (
          <div className="text-center py-16 md:col-span-2 lg:col-span-3">
            <p className="font-serif text-xl mb-2">Você ainda não publicou alertas</p>
            <p className="text-sm text-muted-foreground">
              Toque no botão SOS para criar o primeiro.
            </p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="space-y-3 md:col-span-2 lg:col-span-3">
                <h2 className="font-serif text-lg font-bold">Em andamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {active.map((p) => <PetCard key={p.id} pet={p} />)}
                </div>
              </section>
            )}
            {found.length > 0 && (
              <section className="space-y-3 md:col-span-2 lg:col-span-3">
                <h2 className="font-serif text-lg font-bold">Reencontros 🎉</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {found.map((p) => <PetCard key={p.id} pet={p} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MyAlerts;
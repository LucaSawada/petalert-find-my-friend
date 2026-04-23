import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { timeAgo } from "@/lib/time";
import { Confetti } from "@/components/Confetti";
import { cn } from "@/lib/utils";

type Pet = Tables<"pets">;
type Profile = Tables<"profiles">;

const speciesLabel: Record<string, string> = { dog: "Cão", cat: "Gato", other: "Outro" };

const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { data: petData } = await supabase.from("pets").select("*").eq("id", id).maybeSingle();
      setPet(petData);
      if (petData) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", petData.user_id).maybeSingle();
        setOwner(prof);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel(`pet-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pets", filter: `id=eq.${id}` }, (payload) => {
        setPet(payload.new as Pet);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id]);

  const isOwner = pet && user && pet.user_id === user.id;
  const found = pet?.status === "found";

  const markAsFound = async () => {
    if (!pet) return;
    const message = window.prompt("Mensagem de agradecimento (opcional):") ?? "";
    const { error } = await supabase
      .from("pets")
      .update({ status: "found", found_at: new Date().toISOString(), found_message: message || null })
      .eq("id", pet.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setConfetti(true);
      toast({ title: "🎉 Que notícia maravilhosa!", description: `${pet.name} foi marcado como encontrado.` });
    }
  };

  const startChat = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/chat/${pet?.id}/${pet?.user_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="aspect-square w-full" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="font-serif text-2xl mb-2">Alerta não encontrado</p>
          <Button asChild variant="outline" className="mt-4"><Link to="/">Voltar ao início</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Confetti active={confetti} />

      {/* Foto hero */}
      <div className="relative aspect-square bg-muted">
        {pet.photo_url && (
          <img
            src={pet.photo_url}
            alt={`Foto de ${pet.name}`}
            className={cn("w-full h-full object-cover", found && "grayscale")}
          />
        )}
        <Link
          to="/"
          aria-label="Voltar"
          className="absolute top-4 left-4 h-11 w-11 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {found && (
          <div className="absolute inset-0 bg-success/30 flex items-center justify-center">
            <div className="bg-success text-success-foreground px-6 py-4 rounded-2xl text-center shadow-elegant">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-1" />
              <p className="font-bold text-xl">Pet encontrado!</p>
              {pet.found_at && <p className="text-xs opacity-90 mt-1">{timeAgo(pet.found_at)}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="font-serif text-4xl font-bold">{pet.name}</h1>
            <span className="text-sm font-medium text-muted-foreground">
              {speciesLabel[pet.species]}
            </span>
          </div>
          {pet.breed && <p className="text-muted-foreground">{pet.breed}</p>}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>{pet.address || "Localização não informada"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Sumiu {timeAgo(pet.created_at)}</span>
          </div>
        </div>

        {(pet.color || pet.size) && (
          <div className="grid grid-cols-2 gap-3">
            {pet.color && <Info label="Cor" value={pet.color} />}
            {pet.size && <Info label="Porte" value={pet.size} />}
          </div>
        )}

        {pet.description && (
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h2 className="font-semibold mb-2">Características</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{pet.description}</p>
          </div>
        )}

        {pet.reward && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-primary font-bold">Recompensa</p>
            <p className="font-serif text-xl text-primary">{pet.reward}</p>
          </div>
        )}

        {found && pet.found_message && (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-4">
            <p className="text-sm italic">"{pet.found_message}"</p>
            <p className="text-xs text-muted-foreground mt-2">— {owner?.full_name ?? "Tutor"}</p>
          </div>
        )}
      </div>

      {/* Ações fixas */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-bottom">
        <div className="max-w-md mx-auto flex gap-2">
          {isOwner && !found && (
            <Button onClick={markAsFound} size="lg" className="flex-1 h-14 bg-success hover:bg-success/90 text-success-foreground">
              <CheckCircle2 className="h-5 w-5" /> Marcar como encontrado
            </Button>
          )}
          {!isOwner && !found && (
            <>
              <Button onClick={startChat} size="lg" className="flex-1 h-14">
                <MessageCircle className="h-5 w-5" /> Encontrei
              </Button>
              {(owner?.phone || pet.alt_contact) && (
                <Button asChild size="lg" variant="outline" className="h-14">
                  <a
                    href={`https://wa.me/${(owner?.phone || pet.alt_contact || "").replace(/\D/g, "")}?text=Olá! Vi seu alerta no PetAlert sobre ${pet.name}.`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </>
          )}
          {found && (
            <Button asChild variant="outline" size="lg" className="flex-1 h-14">
              <Link to="/">Ver outros alertas</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-card rounded-xl p-3 border border-border">
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="font-medium mt-0.5">{value}</p>
  </div>
);

export default PetDetails;
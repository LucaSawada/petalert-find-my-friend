import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getCurrentLocation } from "@/lib/geo";
import { pickPhoto, uploadPetPhoto } from "@/lib/photo";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Species = Database["public"]["Enums"]["pet_species"];

const CreateAlert = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(true);

  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [altContact, setAltContact] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // GPS automático ao abrir a tela (heurística: minimizar carga sobre o usuário)
  useEffect(() => {
    void (async () => {
      try {
        const loc = await getCurrentLocation();
        setCoords({ lat: loc.latitude, lng: loc.longitude });
        setAddress(loc.address);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro";
        toast({ title: "Localização indisponível", description: msg, variant: "destructive" });
      } finally {
        setGettingLocation(false);
      }
    })();
  }, [toast]);

  const handlePickPhoto = async () => {
    const file = await pickPhoto();
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!photoFile) {
      toast({ title: "Adicione uma foto", description: "A foto ajuda muito quem encontra o pet.", variant: "destructive" });
      return;
    }
    if (!address.trim()) {
      toast({ title: "Localização obrigatória", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const photoUrl = await uploadPetPhoto(photoFile, user.id);
      const { data, error } = await supabase
        .from("pets")
        .insert({
          user_id: user.id,
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          color: color.trim() || null,
          size: size.trim() || null,
          description: description.trim() || null,
          reward: reward.trim() || null,
          alt_contact: altContact.trim() || null,
          photo_url: photoUrl,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          address: address.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      toast({ title: "Alerta publicado!", description: "Quem está por perto já pode ver." });
      navigate(`/pet/${data.id}`);
    } catch (err) {
      toast({
        title: "Não foi possível publicar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur z-10 border-b border-border">
        <Link to="/" aria-label="Voltar" className="h-10 w-10 -ml-2 flex items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-xl font-bold">Novo alerta</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-5">
        {/* Foto */}
        <button
          type="button"
          onClick={handlePickPhoto}
          className={cn(
            "w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors",
            photoPreview ? "border-transparent" : "border-primary/40 bg-primary/5 active:bg-primary/10",
          )}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Pré-visualização do pet" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-primary">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p className="font-semibold">Tirar foto / escolher</p>
              <p className="text-xs text-muted-foreground mt-1">Toque para usar a câmera</p>
            </div>
          )}
        </button>

        {/* Nome */}
        <div>
          <Label htmlFor="pet-name">Nome do pet *</Label>
          <Input
            id="pet-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Toby"
            className="h-12 mt-1.5"
          />
        </div>

        {/* Espécie */}
        <div>
          <Label>Espécie *</Label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {(["dog", "cat", "other"] as Species[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpecies(s)}
                className={cn(
                  "h-12 rounded-xl border-2 font-medium transition-colors",
                  species === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                {s === "dog" ? "🐶 Cão" : s === "cat" ? "🐱 Gato" : "🐾 Outro"}
              </button>
            ))}
          </div>
        </div>

        {/* Localização */}
        <div>
          <Label htmlFor="pet-address" className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Onde foi visto pela última vez *
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="pet-address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={gettingLocation ? "Detectando localização..." : "Endereço aproximado"}
              className="h-12 pr-10"
            />
            {gettingLocation && (
              <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {coords ? "📍 Localização capturada automaticamente" : "Você pode editar ou digitar manualmente"}
          </p>
        </div>

        {/* Detalhes opcionais */}
        <Collapsible>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border text-left">
            <div>
              <p className="font-semibold">Adicionar mais detalhes</p>
              <p className="text-xs text-muted-foreground">Opcional — quanto mais, melhor</p>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="breed">Raça</Label>
              <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} className="h-12 mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="color">Cor</Label>
                <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-12 mt-1.5" />
              </div>
              <div>
                <Label htmlFor="size">Porte</Label>
                <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Pequeno, médio..." className="h-12 mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="desc">Características</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Coleira, manchas, comportamento..." className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="reward">Recompensa</Label>
              <Input id="reward" value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Ex.: R$ 200" className="h-12 mt-1.5" />
            </div>
            <div>
              <Label htmlFor="alt">Contato alternativo (WhatsApp)</Label>
              <Input id="alt" value={altContact} onChange={(e) => setAltContact(e.target.value)} placeholder="(11) 99999-9999" className="h-12 mt-1.5" />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full h-16 text-lg gradient-sos border-0 text-destructive-foreground shadow-sos hover:opacity-95"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "🚨 Publicar alerta"}
        </Button>
      </form>
    </div>
  );
};

export default CreateAlert;
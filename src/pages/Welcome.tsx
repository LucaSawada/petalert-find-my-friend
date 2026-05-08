import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, Heart, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Welcome = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen gradient-warm flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-8 max-w-xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 rounded-3xl gradient-primary items-center justify-center mb-6 shadow-elegant">
            <PawPrint className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-3">
            PetAlert
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A rede de tutores que devolve pets perdidos para casa em tempo recorde.
          </p>
        </div>

        <ul className="space-y-4 mb-10">
           <Feature icon={MapPin} title="Alerta em menos de 30 segundos" desc="Foto, GPS automático, espécie. Pronto." />
          <Feature icon={Heart} title="Comunidade próxima" desc="Quem está perto vê o alerta primeiro." />
          <Feature icon={PawPrint} title="Reencontros reais" desc="Marque como encontrado e celebre." />
        </ul>

        <div className="space-y-3">
          <Button asChild size="lg" className="w-full h-14 text-base shadow-elegant">
            <Link to="/auth?mode=signup">Criar minha conta</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full h-12">
            <Link to="/auth">Já tenho conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc }: { icon: typeof PawPrint; title: string; desc: string }) => (
  <li className="flex gap-4 items-start">
    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  </li>
);

export default Welcome;
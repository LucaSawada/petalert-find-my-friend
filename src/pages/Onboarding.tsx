import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PawPrint,
  MapPin,
  MessageCircle,
  Search,
  Heart,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Onboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <PawPrint className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">PetAlert</span>
          </div>
          <Button asChild size="sm" className="rounded-full px-4 mr-14">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-14">
        {/* Hero */}
        <section className="text-center pt-4">
          <div className="inline-flex h-20 w-20 rounded-3xl gradient-primary items-center justify-center mb-6 shadow-elegant">
            <PawPrint className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            O que é o PetAlert?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Uma rede solidária de tutores e amantes de animais que se unem para
            devolver pets perdidos para casa. Plataforma 100% gratuita, colaborativa,
            que funciona em qualquer lugar do Brasil.
          </p>
        </section>

        {/* Como funciona */}
        <section>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 text-center">
            Como funciona?
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Pillar
              icon={Clock}
              title="Alerta em menos de 30 segundos"
              desc="Tire a foto, capture o GPS e publique. O fluxo foi pensado para emergências."
            />
            <Pillar
              icon={MapPin}
              title="Mapa em tempo real"
              desc="Pessoas próximas veem o alerta no mapa imediatamente após a publicação."
            />
            <Pillar
              icon={MessageCircle}
              title="Chat integrado"
              desc="Quem encontrou conversa diretamente com o tutor para combinar a entrega."
            />
          </div>
        </section>

        {/* Quem pode usar */}
        <section>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 text-center">
            Quem pode usar?
          </h2>
          <ul className="space-y-3 max-w-2xl mx-auto">
            <Bullet icon={Heart} text="Tutores que perderam seu pet — publique o alerta rapidamente." />
            <Bullet icon={Search} text="Quem encontrou um animal na rua — avise pelo app em segundos." />
            <Bullet icon={Users} text="Comunidade local — acompanhe alertas próximos ao seu bairro e ajude." />
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center pt-4 pb-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-6">
            Cadastre-se gratuitamente e faça parte da rede de reencontros.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="h-14 text-base shadow-elegant px-8"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Criar minha conta <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 text-base px-8"
              onClick={() => navigate("/auth")}
            >
              Já tenho conta
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

const Pillar = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof PawPrint;
  title: string;
  desc: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="font-semibold text-card-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

const Bullet = ({ icon: Icon, text }: { icon: typeof PawPrint; text: string }) => (
  <li className="flex gap-3 items-start rounded-xl border border-border bg-card p-4">
    <div className="h-8 w-8 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-sm sm:text-base text-card-foreground leading-relaxed">{text}</span>
  </li>
);

export default Onboarding;

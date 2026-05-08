import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, MapPin, MessageCircle, Search, ChevronRight, ChevronLeft } from "lucide-react";

interface Slide {
  icon: typeof PawPrint;
  title: string;
  description: string;
  bullets?: string[];
}

const slides: Slide[] = [
  {
    icon: PawPrint,
    title: "O que é o PetAlert?",
    description:
      "Uma rede solidária de tutores e amantes de animais que se unem para devolver pets perdidos para casa.",
    bullets: [
      "Plataforma acadêmica focada em UX para situações de urgência",
      "100% gratuita e colaborativa",
      "Funciona em qualquer lugar do Brasil",
    ],
  },
  {
    icon: MapPin,
    title: "Como funciona?",
    description:
      "Três pilares simples e rápidos para reunir famílias:",
    bullets: [
      "Crie um alerta em menos de 30 segundos com foto e GPS automático",
      "Pessoas próximas ao local veem o alerta no mapa em tempo real",
      "Quem encontrar entra em contato pelo chat integrado",
    ],
  },
  {
    icon: Search,
    title: "Quem pode usar?",
    description:
      "Qualquer pessoa que queira ajudar ou precise de ajuda:",
    bullets: [
      "Tutores que perderam seu pet — publique o alerta rapidamente",
      "Quem encontrou um animal na rua — avise pelo app",
      "Comunidade local — acompanhe alertas próximos ao seu bairro",
    ],
  },
  {
    icon: MessageCircle,
    title: "Pronto para começar?",
    description:
      "Cadastre-se gratuitamente e faça parte da rede de reencontros.",
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = slides[current];
  const Icon = slide.icon;
  const isLast = current === slides.length - 1;

  const next = () => {
    if (isLast) {
      navigate("/welcome");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const prev = () => setCurrent((c) => Math.max(0, c - 1));

  const goTo = (index: number) => setCurrent(index);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Topo com skip */}
      <div className="flex justify-end px-6 pt-8 pb-2">
        {!isLast && (
          <button
            onClick={() => navigate("/welcome")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular
          </button>
        )}
      </div>

      {/* Conteúdo do slide */}
      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex h-24 w-24 rounded-full gradient-primary items-center justify-center mb-6 shadow-elegant">
            <Icon className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            {slide.title}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>

        {slide.bullets && (
          <ul className="space-y-3 mb-8">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-foreground leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Indicadores + navegação */}
      <div className="px-8 pb-10 pt-4 max-w-md mx-auto w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 bg-primary"
                  : "w-2.5 bg-primary/20 hover:bg-primary/40"
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {current > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={prev}
              className="h-14 w-14 shrink-0 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            size="lg"
            onClick={next}
            className={`h-14 text-base shadow-elegant ${
              current > 0 ? "flex-1" : "w-full"
            }`}
          >
            {isLast ? (
              <>
                Começar agora <ChevronRight className="h-5 w-5 ml-1" />
              </>
            ) : (
              <>
                Próximo <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

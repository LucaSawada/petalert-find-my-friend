import { useNavigate } from "react-router-dom";
import { Siren } from "lucide-react";
import { cn } from "@/lib/utils";

interface SosButtonProps {
  className?: string;
}

/**
 * Botão SOS flutuante — sempre visível, dominante (Heurística de Visibilidade).
 * Atalho de uma tocada para o fluxo de criação de alerta.
 */
export const SosButton = ({ className }: SosButtonProps) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/criar")}
      aria-label="Criar alerta SOS — perdi meu pet"
      className={cn(
        "fixed left-1/2 -translate-x-1/2 bottom-20 z-40",
        "h-20 w-20 rounded-full gradient-sos text-destructive-foreground",
        "flex flex-col items-center justify-center gap-0.5",
        "animate-pulse-sos active:scale-95 transition-transform",
        "border-4 border-background",
        className,
      )}
    >
      <Siren className="h-7 w-7" strokeWidth={2.5} />
      <span className="text-[10px] font-bold tracking-wider">SOS</span>
    </button>
  );
};
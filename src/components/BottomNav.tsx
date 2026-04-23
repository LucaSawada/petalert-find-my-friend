import { NavLink } from "react-router-dom";
import { Home, Map, PawPrint, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/mapa", icon: Map, label: "Mapa" },
  { to: "/meus-alertas", icon: PawPrint, label: "Meus" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

export const BottomNav = () => {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border safe-bottom"
    >
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {items.map(({ to, icon: Icon, label }, i) => (
          <li key={to} className={cn(i === 2 && "invisible")}>
            {/* Slot central reservado ao FAB SOS */}
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-xs",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
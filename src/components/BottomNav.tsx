import { NavLink } from "react-router-dom";
import { Home, Map, PawPrint, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useI18n } from "@/hooks/useI18n";
import type { TranslationKey } from "@/lib/translations";

const items: { to: string; icon: typeof Home; key: TranslationKey }[] = [
  { to: "/", icon: Home, key: "nav.home" },
  { to: "/mapa", icon: Map, key: "nav.map" },
  { to: "/meus-alertas", icon: PawPrint, key: "nav.mine" },
  { to: "/chat", icon: MessageCircle, key: "nav.chat" },
  { to: "/perfil", icon: User, key: "nav.profile" },
];

export const BottomNav = () => {
  const unread = useUnreadMessages();
  const { t } = useI18n();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border safe-bottom"
    >
      <ul className="grid grid-cols-5 max-w-7xl mx-auto w-full">
        {items.map(({ to, icon: Icon, key }, i) => (
          <li key={to} className={cn(i === 2 && "invisible")}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-xs text-center whitespace-nowrap",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground",
                )
              }
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {to === "/chat" && unread > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span>{t(key)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
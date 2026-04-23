import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { SosButton } from "./SosButton";

/**
 * Layout do app: bottom-nav fixa + FAB SOS sempre visível,
 * exceto na tela de criação de alerta (onde já estamos no fluxo).
 */
export const AppLayout = () => {
  const { pathname } = useLocation();
  const hideSos = pathname.startsWith("/criar");

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-md mx-auto">
        <Outlet />
      </main>
      {!hideSos && <SosButton />}
      <BottomNav />
    </div>
  );
};
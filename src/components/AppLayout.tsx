import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { SosButton } from "./SosButton";

export const AppLayout = () => {
  const { pathname } = useLocation();
  const hideSos = pathname.startsWith("/criar");

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <Outlet />
      </main>
      {!hideSos && <SosButton />}
      <BottomNav />
    </div>
  );
};
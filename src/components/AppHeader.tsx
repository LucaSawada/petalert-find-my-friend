import { PawPrint } from "lucide-react";

export const AppHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <header className="px-5 pt-8 pb-4">
    <div className="flex items-center gap-2 text-primary mb-1">
      <PawPrint className="h-5 w-5" />
      <span className="text-xs font-bold uppercase tracking-widest">PetAlert</span>
    </div>
    <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
  </header>
);
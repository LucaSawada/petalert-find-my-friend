import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
      }
    })();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/onboarding" replace />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado" });
    }
  };

  return (
    <>
      <AppHeader title="Meu perfil" subtitle="Mantenha seu contato atualizado" />
      <form onSubmit={save} className="px-5 space-y-5">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" value={user.email ?? ""} disabled className="h-12 mt-1.5" />
        </div>
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-12 mt-1.5" />
        </div>
        <div>
          <Label htmlFor="phone">Telefone (WhatsApp)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 mt-1.5" placeholder="(11) 99999-9999" />
          <p className="text-xs text-muted-foreground mt-1">
            Usado para que outros tutores possam te contatar via WhatsApp.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={saving} className="w-full h-14">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>

        <Button type="button" variant="outline" size="lg" onClick={signOut} className="w-full h-14">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </form>
    </>
  );
};

export default Profile;
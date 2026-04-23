import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, PawPrint } from "lucide-react";

const Auth = () => {
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast({ title: "Conta criada!", description: "Bem-vindo ao PetAlert." });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo deu errado";
      toast({
        title: "Não foi possível continuar",
        description: msg.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : msg.includes("already registered")
          ? "Este e-mail já está cadastrado. Entre na sua conta."
          : msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 pt-12 pb-8">
        <Link to="/welcome" className="inline-flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="flex items-center gap-2 text-primary mb-2">
          <PawPrint className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">PetAlert</span>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">
          {mode === "signup" ? "Criar conta" : "Entrar"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {mode === "signup"
            ? "Cadastre-se para publicar e acompanhar alertas."
            : "Acesse para continuar ajudando."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 mt-1.5"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 mt-1.5"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 mt-1.5"
              placeholder="voce@exemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 mt-1.5"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full h-14 text-base shadow-elegant">
            {submitting ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signup" ? "Já tem conta?" : "Não tem conta ainda?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-primary font-semibold underline-offset-4 hover:underline"
          >
            {mode === "signup" ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
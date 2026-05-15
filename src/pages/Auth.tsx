import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, PawPrint, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const Auth = () => {
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useI18n();

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
      <div className="max-w-xl mx-auto px-6 pt-12 pb-8 w-full">
        <Link to="/welcome" className="inline-flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Link>

        <div className="flex items-center gap-2 text-primary mb-2">
          <PawPrint className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">PetAlert</span>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">
          {mode === "signup" ? t("auth.signupTitle") : t("auth.signinTitle")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {mode === "signup" ? t("auth.signupSub") : t("auth.signinSub")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label htmlFor="name">{t("common.fullName")}</Label>
                <Input
                  id="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("common.phone")}</Label>
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
            <Label htmlFor="email">{t("common.email")}</Label>
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
            <Label htmlFor="password">{t("common.password")}</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full h-14 text-base shadow-elegant">
            {submitting ? t("common.wait") : mode === "signup" ? t("common.signup") : t("common.signin")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signup" ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-primary font-semibold underline-offset-4 hover:underline"
          >
            {mode === "signup" ? t("common.signin") : t("common.signup")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
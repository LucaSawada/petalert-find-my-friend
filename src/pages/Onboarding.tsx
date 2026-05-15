import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  PawPrint,
  MapPin,
  MessageCircle,
  Search,
  Heart,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";

const Onboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto pl-5 pr-5 sm:pr-44 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary">
            <PawPrint className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">PetAlert</span>
          </div>
          <Button asChild size="sm" className="rounded-full px-4 hidden sm:inline-flex">
            <Link to="/auth">{t("common.signin")}</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-14">
        {/* Hero */}
        <section className="text-center pt-4">
          <div className="inline-flex h-20 w-20 rounded-3xl gradient-primary items-center justify-center mb-6 shadow-elegant">
            <PawPrint className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            {t("onb.what")}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("onb.intro")}
          </p>
        </section>

        {/* Como funciona */}
        <section>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 text-center">
            {t("onb.how")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Pillar
              icon={Clock}
              title={t("onb.alertTitle")}
              desc={t("onb.alertDesc")}
            />
            <Pillar
              icon={MapPin}
              title={t("onb.mapTitle")}
              desc={t("onb.mapDesc")}
            />
            <Pillar
              icon={MessageCircle}
              title={t("onb.chatTitle")}
              desc={t("onb.chatDesc")}
            />
          </div>
        </section>

        {/* Quem pode usar */}
        <section>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 text-center">
            {t("onb.who")}
          </h2>
          <ul className="space-y-3 max-w-2xl mx-auto">
            <Bullet icon={Heart} text={t("onb.whoTutor")} />
            <Bullet icon={Search} text={t("onb.whoFinder")} />
            <Bullet icon={Users} text={t("onb.whoCommunity")} />
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center pt-4 pb-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            {t("onb.cta")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("onb.ctaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="h-14 text-base shadow-elegant px-8"
              onClick={() => navigate("/auth?mode=signup")}
            >
              {t("onb.createMine")} <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 text-base px-8"
              onClick={() => navigate("/auth")}
            >
              {t("onb.haveAccount")}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

const Pillar = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof PawPrint;
  title: string;
  desc: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="font-semibold text-card-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

const Bullet = ({ icon: Icon, text }: { icon: typeof PawPrint; text: string }) => (
  <li className="flex gap-3 items-start rounded-xl border border-border bg-card p-4">
    <div className="h-8 w-8 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-sm sm:text-base text-card-foreground leading-relaxed">{text}</span>
  </li>
);

export default Onboarding;

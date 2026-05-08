import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/time";
import { MessageCircle } from "lucide-react";

interface Conv {
  pet_id: string;
  other_id: string;
  pet_name: string;
  pet_photo: string | null;
  last_message: string;
  last_at: string;
  other_name: string;
}

const ChatList = () => {
  const { user, loading: authLoading } = useAuth();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs?.length) {
        setLoading(false);
        return;
      }

      const map = new Map<string, Conv>();
      const otherIds = new Set<string>();
      const petIds = new Set<string>();
      for (const m of msgs) {
        const other = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        const key = `${m.pet_id}:${other}`;
        if (!map.has(key)) {
          otherIds.add(other);
          petIds.add(m.pet_id);
          map.set(key, {
            pet_id: m.pet_id,
            other_id: other,
            pet_name: "",
            pet_photo: null,
            last_message: m.content,
            last_at: m.created_at,
            other_name: "",
          });
        }
      }

      const [{ data: petsData }, { data: profiles }] = await Promise.all([
        supabase.from("pets").select("id, name, photo_url").in("id", Array.from(petIds)),
        supabase.from("profiles").select("id, full_name").in("id", Array.from(otherIds)),
      ]);
      const petMap = new Map(petsData?.map((p) => [p.id, p]) ?? []);
      const profMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

      const list = Array.from(map.values()).map((c) => ({
        ...c,
        pet_name: petMap.get(c.pet_id)?.name ?? "Pet",
        pet_photo: petMap.get(c.pet_id)?.photo_url ?? null,
        other_name: profMap.get(c.other_id)?.full_name ?? "Usuário",
      }));

      setConvs(list);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/welcome" replace />;

  return (
    <>
      <AppHeader title="Conversas" subtitle="Chats sobre alertas" />
      <div className="px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : convs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground md:col-span-2 lg:col-span-3">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-serif text-xl mb-1">Nenhuma conversa ainda</p>
            <p className="text-sm">Quando alguém te contatar, vai aparecer aqui.</p>
          </div>
        ) : (
          convs.map((c) => (
            <Link
              key={`${c.pet_id}-${c.other_id}`}
              to={`/chat/${c.pet_id}/${c.other_id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-accent/40 transition-colors"
            >
              <img src={c.pet_photo ?? ""} alt="" className="h-14 w-14 rounded-lg object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="font-semibold truncate">{c.other_name}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(c.last_at)}</span>
                </div>
                <p className="text-xs text-primary mb-0.5">sobre {c.pet_name}</p>
                <p className="text-sm text-muted-foreground truncate">{c.last_message}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
};

export default ChatList;
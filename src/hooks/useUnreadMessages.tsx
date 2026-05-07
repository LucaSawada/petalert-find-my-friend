import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

/**
 * Mantém contagem global de mensagens não lidas e dispara toast ao receber novas.
 */
export function useUnreadMessages() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) { setCount(0); return; }

    const refresh = async () => {
      const { count: c } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .is("read_at", null);
      setCount(c ?? 0);
    };
    void refresh();

    const channel = supabase
      .channel(`unread-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        async (payload) => {
          const m = payload.new as { content: string; pet_id: string; sender_id: string };
          setCount((c) => c + 1);
          // Busca nome do remetente para o toast
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", m.sender_id)
            .maybeSingle();
          toast({
            title: `Nova mensagem de ${prof?.full_name ?? "alguém"}`,
            description: m.content.length > 80 ? `${m.content.slice(0, 80)}…` : m.content,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        () => { void refresh(); },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  return count;
}
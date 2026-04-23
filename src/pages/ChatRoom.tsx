import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = Tables<"messages">;

const ChatRoom = () => {
  const { petId, otherId } = useParams<{ petId: string; otherId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [petName, setPetName] = useState("");
  const [otherName, setOtherName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !petId || !otherId) return;
    void (async () => {
      const [{ data: msgs }, { data: pet }, { data: prof }] = await Promise.all([
        supabase
          .from("messages")
          .select("*")
          .eq("pet_id", petId)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
          .order("created_at"),
        supabase.from("pets").select("name").eq("id", petId).maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", otherId).maybeSingle(),
      ]);
      setMessages(msgs ?? []);
      setPetName(pet?.name ?? "Pet");
      setOtherName(prof?.full_name ?? "Usuário");
    })();

    const channel = supabase
      .channel(`chat-${petId}-${otherId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `pet_id=eq.${petId}` }, (payload) => {
        const m = payload.new as Message;
        if (
          (m.sender_id === user?.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === user?.id)
        ) {
          setMessages((prev) => [...prev, m]);
        }
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, petId, otherId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/welcome" replace />;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !petId || !otherId) return;
    const content = text.trim();
    setText("");
    await supabase.from("messages").insert({
      pet_id: petId,
      sender_id: user.id,
      receiver_id: otherId,
      content,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-4 py-3 flex items-center gap-3 border-b border-border bg-card sticky top-0 z-10">
        <Link to="/chat" aria-label="Voltar" className="h-10 w-10 -ml-2 flex items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{otherName}</p>
          <Link to={`/pet/${petId}`} className="text-xs text-primary truncate block">
            sobre {petName}
          </Link>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Inicie a conversa de forma respeitosa 💛
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md",
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="p-3 border-t border-border bg-card flex gap-2 safe-bottom">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mensagem..."
          className="h-12"
        />
        <Button type="submit" size="icon" className="h-12 w-12 shrink-0">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatRoom;
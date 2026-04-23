import { useEffect, useState } from "react";

const colors = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--destructive))", "hsl(45 90% 55%)"];

export const Confetti = ({ active }: { active: boolean }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  useEffect(() => {
    if (active) {
      setPieces(Array.from({ length: 24 }, (_, i) => i));
      const t = setTimeout(() => setPieces([]), 1500);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!pieces.length) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center">
      {pieces.map((i) => (
        <span
          key={i}
          className="confetti-piece absolute bottom-1/3 w-2.5 h-2.5 rounded-sm"
          style={{
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 6) * 0.05}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};
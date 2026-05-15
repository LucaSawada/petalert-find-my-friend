import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type FontSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<FontSize, string> = {
  sm: "87.5%",
  md: "100%",
  lg: "112.5%",
  xl: "125%",
};

const order: FontSize[] = ["sm", "md", "lg", "xl"];

type Ctx = {
  size: FontSize;
  setSize: (s: FontSize) => void;
  cycle: () => void;
};

const FontSizeContext = createContext<Ctx | undefined>(undefined);

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [size, setSizeState] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "md";
    return (localStorage.getItem("petalert-font-size") as FontSize) || "md";
  });

  useEffect(() => {
    document.documentElement.style.fontSize = sizeMap[size];
    localStorage.setItem("petalert-font-size", size);
  }, [size]);

  const cycle = () => {
    const i = order.indexOf(size);
    setSizeState(order[(i + 1) % order.length]);
  };

  return (
    <FontSizeContext.Provider value={{ size, setSize: setSizeState, cycle }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize must be used within FontSizeProvider");
  return ctx;
};
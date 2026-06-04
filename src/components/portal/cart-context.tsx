"use client";

import * as React from "react";

export interface CartLine {
  partId: string;
  sku: string;
  partNumber: string;
  name: string;
  unitPrice: number;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (partId: string, qty: number) => void;
  remove: (partId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "omg.cart.v1";
const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  const add: CartContextValue["add"] = (line, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.partId === line.partId);
      if (existing) {
        return prev.map((l) => (l.partId === line.partId ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { ...line, qty }];
    });
  };

  const setQty: CartContextValue["setQty"] = (partId, qty) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.partId !== partId) : prev.map((l) => (l.partId === partId ? { ...l, qty } : l))
    );
  };

  const remove: CartContextValue["remove"] = (partId) => {
    setLines((prev) => prev.filter((l) => l.partId !== partId));
  };

  const clear: CartContextValue["clear"] = () => setLines([]);

  const count = lines.reduce((a, l) => a + l.qty, 0);
  const total = lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);

  return (
    <CartContext.Provider value={{ lines, count, total, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

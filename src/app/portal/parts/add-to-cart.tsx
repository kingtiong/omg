"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart, type CartLine } from "@/components/portal/cart-context";

export function AddToCartButton({
  part,
  disabled,
}: {
  part: Omit<CartLine, "qty">;
  disabled?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    add(part, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Button size="sm" variant={added ? "outline" : "primary"} onClick={onClick} disabled={disabled}>
      {disabled ? "Unavailable" : added ? "Added ✓" : "Add to cart"}
    </Button>
  );
}

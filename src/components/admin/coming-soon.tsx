import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function ComingSoon({ phase, title, description }: { phase: string; title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Sparkles className="h-8 w-8 text-gold" />
        <div className="text-[11px] uppercase tracking-[0.4em] text-gold">{phase}</div>
        <h2 className="font-serif text-3xl text-platinum">{title}</h2>
        <p className="max-w-xl text-sm text-ink-dim">{description}</p>
      </CardContent>
    </Card>
  );
}

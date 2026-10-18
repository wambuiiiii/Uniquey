import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ComingSoon({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full border border-primary/40 bg-primary/10 p-3">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-serif text-2xl text-foreground">Coming in the next release</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {children ??
              "This module is scaffolded and will be wired up once Lovable Cloud is enabled for real data."}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="hero">Notify me</Button>
            <Button variant="outline">Back to overview</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

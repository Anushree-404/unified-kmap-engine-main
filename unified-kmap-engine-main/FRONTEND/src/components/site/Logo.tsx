import { Leaf } from "lucide-react";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={
          inverted
            ? "flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur"
            : "flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-leaf)]"
        }
      >
        <Leaf className={inverted ? "size-5 text-primary-foreground" : "size-5 text-primary-foreground"} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        AGROVA <span className="text-primary">AI</span>
      </span>
    </span>
  );
}
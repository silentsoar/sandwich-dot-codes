import { cn } from "@/lib/utils";

interface HeroShaderBackgroundProps {
  className?: string;
}

export function HeroShaderBackground({ className }: HeroShaderBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden",
        "bg-[radial-gradient(circle_at_22%_24%,rgba(214,179,71,0.22),transparent_34%),radial-gradient(circle_at_76%_42%,rgba(111,157,154,0.20),transparent_36%),radial-gradient(circle_at_48%_80%,rgba(184,167,204,0.16),transparent_38%)]",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(245,239,228,0.60),rgba(245,239,228,0.10)_42%,rgba(245,239,228,0.68))] dark:bg-[linear-gradient(115deg,rgba(26,24,22,0.50),rgba(26,24,22,0.10)_42%,rgba(26,24,22,0.58))]" />
    </div>
  );
}

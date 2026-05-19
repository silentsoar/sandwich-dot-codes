import { DoodleAccent } from "@/components/decorative/DoodleAccent";

const doodles = [
  { variant: "star", color: "#D6B347", size: 96, className: "left-[4%] top-[7%] -rotate-12 opacity-[0.10]" },
  { variant: "circle", color: "#6F9D9A", size: 118, className: "right-[6%] top-[12%] rotate-6 opacity-[0.09]" },
  { variant: "squiggle", color: "#B8A7CC", size: 128, className: "left-[20%] top-[24%] rotate-3 opacity-[0.08]" },
  { variant: "dot-cluster", color: "#D98B73", size: 88, className: "right-[18%] top-[31%] -rotate-6 opacity-[0.09]" },
  { variant: "x", color: "#9FAF6F", size: 72, className: "left-[7%] top-[42%] rotate-12 opacity-[0.08]" },
  { variant: "arrow", color: "#D6B347", size: 112, className: "right-[9%] top-[49%] -rotate-12 opacity-[0.08]" },
  { variant: "circle", color: "#D98B73", size: 160, className: "left-[28%] top-[58%] rotate-12 opacity-[0.06]" },
  { variant: "star", color: "#6F9D9A", size: 132, className: "right-[26%] top-[68%] -rotate-6 opacity-[0.08]" },
  { variant: "squiggle", color: "#D6B347", size: 176, className: "left-[5%] top-[78%] -rotate-3 opacity-[0.07]" },
  { variant: "dot-cluster", color: "#B8A7CC", size: 120, className: "right-[5%] top-[86%] rotate-6 opacity-[0.08]" },
  { variant: "x", color: "#D98B73", size: 104, className: "left-[46%] top-[10%] rotate-6 opacity-[0.06]" },
  { variant: "arrow", color: "#9FAF6F", size: 144, className: "left-[55%] top-[37%] rotate-12 opacity-[0.07]" },
] as const;

export function DoodleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block" aria-hidden="true">
      {doodles.map((doodle, index) => (
        <div key={index} className={`absolute ${doodle.className}`}>
          <DoodleAccent variant={doodle.variant} color={doodle.color} size={doodle.size} />
        </div>
      ))}
    </div>
  );
}

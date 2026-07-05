import { FEATURES } from "@/lib/constants";

export function Features() {
  return (
    <section className="border-y border-line bg-background">
      <div className="container-wide grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-accent-dark">
              <Icon size={22} />
            </div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

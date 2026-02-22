interface SectionHeaderProps {
  eyebrow: string
  title: React.ReactNode
  description?: string
  align?: "center" | "left"
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <div
        className={`mb-6 flex items-center gap-4 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <span className="block h-px w-10 bg-gold" />
        <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[0.15em] text-gold">
          {eyebrow}
        </span>
        <span className="block h-px w-10 bg-gold" />
      </div>
      <h2 className="font-serif text-[clamp(2.2rem,4vw,3.5rem)] font-normal leading-tight text-cream">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl font-sans text-base text-body">
          {description}
        </p>
      )}
    </div>
  )
}

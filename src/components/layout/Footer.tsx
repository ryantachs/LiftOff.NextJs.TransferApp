import Link from "next/link"

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
]

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-[rgba(10,14,20,0.95)] px-6 py-12 lg:px-16">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-6 md:grid-cols-2">
        {/* Left — logo + copyright */}
        <div>
          <Link href="/" className="font-serif text-[1.4rem] leading-none">
            <span className="text-cream">Arrive</span>
            <span className="text-gold">Smart</span>
          </Link>
          <p className="mt-2 font-sans text-[0.78rem] text-body">
            © {new Date().getFullYear()} ArriveSmart. All rights reserved.
          </p>
        </div>

        {/* Right — links */}
        <div className="flex flex-wrap gap-6 md:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-sans text-[0.78rem] uppercase tracking-[0.08em] text-body transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

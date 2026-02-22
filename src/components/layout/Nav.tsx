import Link from "next/link"
import { auth } from "@/auth"

export default async function Nav() {
  const session = await auth()

  return (
    <nav className="fixed top-0 left-0 z-100 w-full border-b border-gold/10 bg-[linear-gradient(to_bottom,rgba(13,17,23,0.95),transparent)] backdrop-blur-[8px]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 lg:px-16">
        {/* Logo */}
        <Link href="/" className="font-serif text-[1.6rem] leading-none">
          <span className="text-cream">Arrive</span>
          <span className="text-gold">Smart</span>
        </Link>

        {/* Centre links — hidden on mobile */}
        <div className="hidden items-center gap-8 md:flex">
          {["Fleet", "How It Works", "Airports"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              className="font-sans text-[0.85rem] uppercase tracking-[0.08em] text-subtle transition-colors hover:text-gold"
            >
              {label}
            </a>
          ))}
          {session ? (
            <Link
              href="/dashboard"
              className="font-sans text-[0.85rem] uppercase tracking-[0.08em] text-subtle transition-colors hover:text-gold"
            >
              My Bookings
            </Link>
          ) : (
            <Link
              href="/login"
              className="font-sans text-[0.85rem] uppercase tracking-[0.08em] text-subtle transition-colors hover:text-gold"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/book"
          className="rounded-[2px] bg-gold px-5 py-2 font-sans text-[0.85rem] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-gold-light"
        >
          Book Now
        </Link>
      </div>
    </nav>
  )
}

import Link from "next/link";
import { STORE, FOOTER_LINKS, SOCIALS } from "@/lib/constants";
import { Newsletter } from "@/components/common/newsletter";

const PAYMENTS = ["Visa", "Mastercard", "UPI", "Razorpay", "Rupay"];

export function Footer() {
  return (
    <footer>
      <Newsletter />
      <div className="border-t border-line bg-secondary">
        <div className="container-wide grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4">
            <span className="font-heading text-2xl font-semibold">SRUVALLE</span>
            <p className="max-w-xs text-sm text-muted">{STORE.tagline}</p>
            <p className="text-sm text-muted">{STORE.address}</p>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background text-ink transition-colors hover:bg-ink hover:text-background"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={FOOTER_LINKS.shop} />
          <FooterCol title="Customer Service" links={FOOTER_LINKS.service} />
          <FooterCol title="Company" links={FOOTER_LINKS.company} />
        </div>

        <div className="border-t border-line">
          <div className="container-wide flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted md:flex-row">
            <p>© {new Date().getFullYear()} Sruvalle Fashion. All rights reserved.</p>
            <div className="flex items-center gap-2">
              {PAYMENTS.map((p) => (
                <span
                  key={p}
                  className="rounded border border-line bg-background px-2 py-1 text-[10px] font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

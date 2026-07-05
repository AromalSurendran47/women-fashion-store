import Image from "next/image";
import Link from "next/link";
import { authVisual } from "@/data/images";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      {/* Visual */}
      <div className="relative hidden lg:block">
        <Image src={authVisual()} alt="Sruvalle" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <div className="absolute bottom-10 left-10 text-background">
          <span className="font-heading text-3xl font-semibold">SRUVALLE</span>
          <p className="mt-2 max-w-xs text-sm text-background/80">
            Effortless fashion, thoughtfully made for the modern woman.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 block text-center font-heading text-2xl font-semibold lg:hidden">
            SRUVALLE
          </Link>
          <h1 className="text-2xl font-medium md:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export const authInputCls =
  "h-12 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-ink";

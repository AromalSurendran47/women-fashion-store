"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Check, Send } from "lucide-react";
import { STORE } from "@/lib/constants";
import { useFaqs } from "@/hooks/use-catalog";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionTitle } from "@/components/ui/section-title";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-background px-4 text-sm outline-none focus:border-ink";

const CONTACTS = [
  { icon: Mail, label: "Email", value: STORE.email },
  { icon: Phone, label: "Phone", value: STORE.phone },
  { icon: MessageCircle, label: "WhatsApp", value: STORE.whatsapp },
  { icon: MapPin, label: "Studio", value: STORE.address },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { data: faqs } = useFaqs();

  return (
    <div className="container-wide py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <div className="mb-10 mt-4 text-center">
        <h1 className="text-3xl font-medium md:text-5xl">Get in Touch</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Questions about an order, sizing or a style? We&apos;re here to help.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Form */}
        <div>
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-line py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Check size={28} />
              </div>
              <h3 className="text-xl font-medium">Message sent!</h3>
              <p className="max-w-xs text-sm text-muted">
                Thanks for reaching out. Our team will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Your name" className={inputCls} />
                <input required type="email" placeholder="Email address" className={inputCls} />
              </div>
              <input placeholder="Subject" className={inputCls} />
              <textarea
                required
                rows={6}
                placeholder="How can we help?"
                className="w-full rounded-xl border border-line bg-background p-4 text-sm outline-none focus:border-ink"
              />
              <Button type="submit" className="self-start">
                <Send size={15} /> Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Info + map */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {CONTACTS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-2 rounded-2xl border border-line p-5">
                <Icon size={20} className="text-accent-dark" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
          <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-line bg-secondary">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(#e2ddd6 1px, transparent 1px), linear-gradient(90deg, #e2ddd6 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative flex flex-col items-center gap-2 text-muted">
              <MapPin size={28} className="text-accent-dark" />
              <span className="text-sm font-medium">Souparnika, Vamanapuram, Thiruvananthapuram</span>
              <span className="text-xs">Google Map placeholder</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="mx-auto mt-20 max-w-3xl scroll-mt-24">
        <SectionTitle eyebrow="Need answers?" title="Frequently Asked Questions" />
        <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
      </div>
    </div>
  );
}

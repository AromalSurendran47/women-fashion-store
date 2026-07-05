"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="bg-ink text-background">
      <div className="container-wide flex flex-col items-center gap-6 py-16 text-center md:py-20">
        <Mail size={32} className="text-accent" />
        <div className="space-y-2">
          <h2 className="text-3xl font-medium md:text-4xl">Join the Sruvalle circle</h2>
          <p className="mx-auto max-w-md text-sm text-background/70">
            Be first to know about new drops, private sales and styling notes. Get 10% off your
            first order.
          </p>
        </div>

        {done ? (
          <p className="flex items-center gap-2 text-sm text-accent">
            <Check size={16} /> Thanks for subscribing! Check your inbox.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setDone(true);
            }}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-full border border-background/20 bg-transparent px-5 text-sm text-background placeholder:text-background/50 focus:border-accent focus:outline-none"
            />
            <Button type="submit" variant="accent" className="h-12">
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

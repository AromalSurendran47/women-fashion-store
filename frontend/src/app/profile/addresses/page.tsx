"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line: string;
  isDefault: boolean;
}

const INITIAL: Address[] = [
  {
    id: "a1",
    label: "Home",
    name: "Ananya Sharma",
    phone: "+91 98765 43210",
    line: "12 Palm Grove, Indiranagar, Bengaluru, Karnataka 560038",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Work",
    name: "Ananya Sharma",
    phone: "+91 98765 43210",
    line: "4th Floor, Prestige Tower, MG Road, Bengaluru, Karnataka 560001",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(INITIAL);

  const makeDefault = (id: string) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  const remove = (id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Saved Addresses</h2>
        <Button size="sm">
          <Plus size={15} /> Add New
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-line p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <MapPin size={15} className="text-accent-dark" /> {a.label}
              </span>
              {a.isDefault && <Badge variant="light">Default</Badge>}
            </div>
            <div className="text-sm text-muted">
              <p className="font-medium text-ink">{a.name}</p>
              <p>{a.line}</p>
              <p className="mt-1">{a.phone}</p>
            </div>
            <div className="mt-auto flex items-center gap-3 border-t border-line pt-3 text-sm">
              <button className="flex items-center gap-1.5 text-muted hover:text-ink">
                <Pencil size={14} /> Edit
              </button>
              {!a.isDefault && (
                <>
                  <button
                    onClick={() => makeDefault(a.id)}
                    className="flex items-center gap-1.5 text-muted hover:text-ink"
                  >
                    <Check size={14} /> Set default
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="ml-auto flex items-center gap-1.5 text-muted hover:text-sale"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

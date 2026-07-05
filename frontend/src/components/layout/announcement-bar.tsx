"use client";

import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "@/lib/constants";

export function Announcement() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-ink text-background">
      <div className="container-wide flex h-9 items-center justify-center overflow-hidden text-center text-[11px] font-medium tracking-wide sm:text-xs">
        <span key={index} className="animate-fade-up">
          {ANNOUNCEMENTS[index]}
        </span>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto md:flex-col">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary md:h-24 md:w-20",
              active === i ? "ring-2 ring-ink" : "ring-1 ring-line"
            )}
          >
            <Image src={src} alt={`${name} ${i + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image with hover-zoom */}
      <div
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-secondary"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 45vw"
          className={cn("object-cover transition-transform duration-200", zoom && "scale-150")}
          style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
        />
      </div>
    </div>
  );
}

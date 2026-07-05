"use client";

import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-mounted";

export function ProfileHeader() {
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);

  const name = mounted && user ? user.name : "";
  const email = mounted && user ? user.email : "";
  const avatar =
    mounted && user?.avatar ? user.avatar : "https://i.pravatar.cc/150?img=8";

  return (
    <div className="mb-8 mt-4 flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-secondary">
        <Image src={avatar} alt="Avatar" fill sizes="64px" className="object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-medium">Hello{name ? `, ${name.split(" ")[0]}` : ""}</h1>
        <p className="text-sm text-muted">{email || "Welcome to your account"}</p>
      </div>
    </div>
  );
}

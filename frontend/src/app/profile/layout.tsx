import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileHeader } from "@/components/profile/profile-header";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "My Account",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="container-wide py-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />

        <ProfileHeader />

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <ProfileSidebar />
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}

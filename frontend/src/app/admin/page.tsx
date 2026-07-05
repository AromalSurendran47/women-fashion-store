"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, IndianRupee, ArrowLeft, LogOut, Loader2, Boxes } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { apiGetAuthed } from "@/lib/auth-api";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AuthUser } from "@/types";

interface Stats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
}

interface AdminOrder {
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  return (
    <AuthGuard adminOnly>
      <AdminDashboard />
    </AuthGuard>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const [s, u, o] = await Promise.all([
        apiGetAuthed<Stats | null>("/admin/stats", token, null),
        apiGetAuthed<AuthUser[]>("/admin/users", token, []),
        apiGetAuthed<AdminOrder[]>("/orders", token, []),
      ]);
      setStats(s);
      setUsers(u);
      setOrders(o);
      setLoading(false);
    })();
  }, [token]);

  const cards = [
    { icon: Package, label: "Products", value: stats?.products ?? "—" },
    { icon: ShoppingCart, label: "Orders", value: stats?.orders ?? "—" },
    { icon: Users, label: "Customers", value: stats?.users ?? "—" },
    {
      icon: IndianRupee,
      label: "Revenue",
      value: stats ? formatPrice(stats.revenue) : "—",
    },
  ];

  return (
    <div className="container-wide py-8">
      {/* Top bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium md:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-muted">Signed in as {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            <Boxes size={15} /> Manage Products
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            <Users size={15} /> Manage Customers
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            <ShoppingCart size={15} /> Manage Orders
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            <ArrowLeft size={15} /> Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink hover:text-sale"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-accent-dark" size={28} />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-line p-5">
                <Icon size={20} className="text-accent-dark" />
                <p className="mt-3 text-2xl font-medium">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent orders */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Recent Orders</h2>
                <Link href="/admin/orders" className="text-sm underline hover:text-accent-dark">
                  Manage all
                </Link>
              </div>
              <div className="overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.orderNumber}>
                        <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                        <td className="px-4 py-3 text-muted">{o.customerName}</td>
                        <td className="px-4 py-3">{formatPrice(o.total)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={o.status === "Delivered" ? "new" : "light"}>
                            {o.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Customers */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Customers ({users.length})</h2>
                <Link href="/admin/customers" className="text-sm underline hover:text-accent-dark">
                  Manage all
                </Link>
              </div>
              <div className="flex flex-col divide-y divide-line rounded-2xl border border-line">
                {users.slice(0, 8).map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-secondary">
                      <Image src={u.avatar} alt={u.name} fill sizes="36px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted">{u.email}</p>
                    </div>
                    <Badge variant={u.role === "admin" ? "accent" : "light"}>{u.role}</Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

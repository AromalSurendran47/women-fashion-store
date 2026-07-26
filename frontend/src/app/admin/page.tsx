"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  ArrowLeft,
  LogOut,
  Loader2,
  Boxes,
  Tags,
  Newspaper,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import {
  apiGetAuthed,
  apiGetAdminDashboard,
  apiGetTopCategories,
  type AdminDashboard,
  type TopCategory,
} from "@/lib/auth-api";
import { formatPrice } from "@/lib/utils";
import { AVATAR_FALLBACK } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { RevenueAreaChart, DonutChart, HBarChart } from "@/components/admin/charts";
import type { AuthUser } from "@/types";

interface AdminOrder {
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

/** Fixed slice order + the reserved status palette (labels always shown beside colors). */
const PAYMENT_SLICES = [
  { key: "Paid", color: "#0ca30c" },
  { key: "Pending", color: "#fab219" },
  { key: "Failed", color: "#d03b3b" },
  { key: "Refunded", color: "#ec835a" },
];

const MANAGE_LINKS = [
  { href: "/admin/products", label: "Manage Products", icon: Boxes },
  { href: "/admin/categories", label: "Manage Categories", icon: Tags },
  { href: "/admin/customers", label: "Manage Customers", icon: Users },
  { href: "/admin/orders", label: "Manage Orders", icon: ShoppingCart },
  { href: "/admin/blogs", label: "Manage Blog", icon: Newspaper },
];

export default function AdminPage() {
  return (
    <AuthGuard adminOnly>
      <AdminDashboardPage />
    </AuthGuard>
  );
}

const REVENUE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "custom", label: "Custom" },
];

const CATEGORY_PRESETS = [
  { id: "today", label: "Today" },
  { id: "1m", label: "1 month" },
  { id: "custom", label: "Custom" },
];

/** Local (IST) calendar day as YYYY-MM-DD, optionally shifted by N days. */
function dayStr(shiftDays = 0): string {
  const d = new Date(Date.now() + shiftDays * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Resolve a preset id (+ applied custom range) to from/to, or null while custom is unapplied. */
function rangeOf(
  preset: string,
  applied: { from: string; to: string } | null
): { from: string; to: string } | null {
  switch (preset) {
    case "today":
      return { from: dayStr(), to: dayStr() };
    case "7d":
      return { from: dayStr(-6), to: dayStr() };
    case "30d":
    case "1m":
      return { from: dayStr(-29), to: dayStr() };
    default:
      return applied;
  }
}

function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const token = useAuthStore((s) => s.token);
  const [dash, setDash] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  // Revenue-chart date range
  const [preset, setPreset] = useState("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [applied, setApplied] = useState<{ from: string; to: string } | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  // Best-selling-categories date range (independent of the revenue chart)
  const [catPreset, setCatPreset] = useState("1m");
  const [catCustom, setCatCustom] = useState({ from: "", to: "" });
  const [catApplied, setCatApplied] = useState<{ from: string; to: string } | null>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [categories, setCategories] = useState<TopCategory[] | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const [u, o] = await Promise.all([
        apiGetAuthed<AuthUser[]>("/admin/users", token, []),
        apiGetAuthed<AdminOrder[]>("/orders", token, []),
      ]);
      setUsers(u);
      setOrders(o);
    })();
  }, [token]);

  // Refetch aggregates whenever the selected range changes (custom waits for Apply).
  useEffect(() => {
    if (!token) return;
    const range = rangeOf(preset, applied);
    if (!range) return;
    setChartLoading(true);
    (async () => {
      setDash(await apiGetAdminDashboard(token, range));
      setChartLoading(false);
    })();
  }, [token, preset, applied]);

  // The categories card has its own range and endpoint.
  useEffect(() => {
    if (!token) return;
    const range = rangeOf(catPreset, catApplied);
    if (!range) return;
    setCatLoading(true);
    (async () => {
      const res = await apiGetTopCategories(token, range);
      setCategories(res?.categories ?? []);
      setCatLoading(false);
    })();
  }, [token, catPreset, catApplied]);

  const loading = dash === null;

  const paymentSlices = PAYMENT_SLICES.map((s) => ({
    label: s.key,
    color: s.color,
    value: dash?.paymentStatus[s.key] ?? 0,
  }));

  const rangeRevenue = dash?.revenueByDay.reduce((s, d) => s + d.revenue, 0) ?? 0;
  const rangeOrders = dash?.revenueByDay.reduce((s, d) => s + d.orders, 0) ?? 0;

  return (
    <div className="container-wide py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium md:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-muted">Signed in as {user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MANAGE_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
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
        <div className="flex flex-col gap-6">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              icon={IndianRupee}
              label="Revenue"
              value={dash ? formatPrice(dash.revenue) : "—"}
              delta={dash ? delta(dash.revenue30, dash.revenuePrev30) : null}
            />
            <StatTile
              icon={ShoppingCart}
              label="Orders"
              value={dash?.orders ?? "—"}
              delta={dash ? delta(dash.orders30, dash.ordersPrev30) : null}
            />
            <StatTile icon={Users} label="Customers" value={dash?.users ?? "—"} />
            <StatTile icon={Package} label="Products" value={dash?.products ?? "—"} />
          </div>

          {/* Charts row 1 */}
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Revenue"
              subtitle={`${formatPrice(rangeRevenue)} across ${rangeOrders} order${rangeOrders === 1 ? "" : "s"}`}
              actions={
                <RangeControl
                  presets={REVENUE_PRESETS}
                  preset={preset}
                  onPreset={setPreset}
                  custom={custom}
                  onCustom={setCustom}
                  onApply={() => setApplied({ ...custom })}
                />
              }
            >
              <div className="relative">
                {dash && <RevenueAreaChart data={dash.revenueByDay} />}
                {chartLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="animate-spin text-accent-dark" size={22} />
                  </div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Payments" subtitle="All orders by payment status">
              <DonutChart
                data={paymentSlices}
                centerLabel="Total orders"
                ariaLabel="Orders by payment status"
              />
            </ChartCard>
          </div>

          {/* Best-selling categories — has its own date range */}
          <ChartCard
            title="Best-selling categories"
            subtitle={`Units sold ${
              catPreset === "today"
                ? "today"
                : catPreset === "1m"
                ? "in the last month"
                : "in the selected period"
            } — most sold first`}
            actions={
              <RangeControl
                presets={CATEGORY_PRESETS}
                preset={catPreset}
                onPreset={setCatPreset}
                custom={catCustom}
                onCustom={setCatCustom}
                onApply={() => setCatApplied({ ...catCustom })}
              />
            }
          >
            <div className="relative">
              {categories === null ? (
                <div className="flex min-h-[120px] items-center justify-center">
                  <Loader2 className="animate-spin text-accent-dark" size={22} />
                </div>
              ) : (
                <HBarChart
                  data={categories.map((c) => ({
                    label: c.name,
                    value: c.units,
                    detail: formatPrice(c.revenue),
                  }))}
                  format={(v) => `${v} sold`}
                />
              )}
              {catLoading && categories !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="animate-spin text-accent-dark" size={22} />
                </div>
              )}
            </div>
          </ChartCard>

          {/* Lists */}
          <div className="grid gap-6 lg:grid-cols-2">
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
                      <Image
                        src={u.avatar || AVATAR_FALLBACK}
                        alt={u.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
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

/* ------------------------------ pieces ------------------------------ */

/** Preset pills + custom from/to pickers, shared by the range-filtered cards. */
function RangeControl({
  presets,
  preset,
  onPreset,
  custom,
  onCustom,
  onApply,
}: {
  presets: { id: string; label: string }[];
  preset: string;
  onPreset: (id: string) => void;
  custom: { from: string; to: string };
  onCustom: React.Dispatch<React.SetStateAction<{ from: string; to: string }>>;
  onApply: () => void;
}) {
  const valid =
    Boolean(custom.from && custom.to) && custom.from <= custom.to && custom.to <= dayStr();
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {presets.map((p) => (
        <button
          key={p.id}
          onClick={() => onPreset(p.id)}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            preset === p.id ? "border-ink bg-ink text-background" : "border-line hover:border-ink"
          }`}
        >
          {p.label}
        </button>
      ))}
      {preset === "custom" && (
        <span className="flex flex-wrap items-center gap-1.5">
          <input
            type="date"
            value={custom.from}
            max={custom.to || dayStr()}
            onChange={(e) => onCustom((c) => ({ ...c, from: e.target.value }))}
            className="h-8 rounded-lg border border-line bg-background px-2 text-xs outline-none focus:border-ink"
          />
          <span className="text-xs text-muted">to</span>
          <input
            type="date"
            value={custom.to}
            min={custom.from || undefined}
            max={dayStr()}
            onChange={(e) => onCustom((c) => ({ ...c, to: e.target.value }))}
            className="h-8 rounded-lg border border-line bg-background px-2 text-xs outline-none focus:border-ink"
          />
          <button
            onClick={onApply}
            disabled={!valid}
            className="rounded-full bg-ink px-3 py-1.5 text-xs text-background disabled:opacity-40"
          >
            Apply
          </button>
        </span>
      )}
    </div>
  );
}

/** % change of the last 30 days vs the 30 before. Null when there's no baseline. */
function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function StatTile({
  icon: Icon,
  label,
  value,
  delta = null,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  delta?: number | null;
}) {
  return (
    <div className="rounded-2xl border border-line p-5">
      <div className="flex items-start justify-between">
        <Icon size={20} className="text-accent-dark" />
        {delta !== null && (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              delta >= 0 ? "text-emerald-600" : "text-sale"
            }`}
            title="Last 30 days vs the 30 before"
          >
            {delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-medium">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  actions,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-line p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

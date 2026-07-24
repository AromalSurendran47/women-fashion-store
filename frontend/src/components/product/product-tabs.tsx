"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ThumbsUp, Star, Loader2 } from "lucide-react";
import type { Product, Review } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { AVATAR_FALLBACK } from "@/lib/constants";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-mounted";
import { apiSubmitReview, apiToggleHelpful, apiDeleteReview } from "@/lib/auth-api";
import { toast } from "@/store/toast-store";

const TABS = ["Description", "Specifications", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({ product, reviews }: { product: Product; reviews: Review[] }) {
  const [tab, setTab] = useState<Tab>("Description");
  const [list, setList] = useState<Review[]>(reviews);
  const [agg, setAgg] = useState({ rating: product.rating, reviewCount: product.reviewCount });

  return (
    <div className="mt-16">
      <div className="flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors",
              tab === t ? "text-ink" : "text-muted hover:text-ink"
            )}
          >
            {t}
            {t === "Reviews" && ` (${list.length})`}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" />}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === "Description" && (
          <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
            <p>{product.description}</p>
            <div>
              <h4 className="mb-2 font-medium text-ink">Care instructions</h4>
              <ul className="space-y-1">
                {product.careInstructions.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-accent-dark" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "Specifications" && (
          <dl className="grid max-w-2xl grid-cols-1 gap-y-3 text-sm sm:grid-cols-2">
            {[
              ["Brand", product.brand],
              ["Material", product.material],
              ["Fabric", product.fabric],
              ["Fit", product.fit],
              ["Category", product.categoryName],
              ["Available sizes", product.sizes.join(", ")],
              ["SKU", product.sku],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line py-2 pr-6">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "Reviews" && (
          <ReviewsTab
            product={product}
            list={list}
            setList={setList}
            agg={agg}
            setAgg={setAgg}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Reviews ------------------------------- */

function ReviewsTab({
  product,
  list,
  setList,
  agg,
  setAgg,
}: {
  product: Product;
  list: Review[];
  setList: React.Dispatch<React.SetStateAction<Review[]>>;
  agg: { rating: number; reviewCount: number };
  setAgg: (a: { rating: number; reviewCount: number }) => void;
}) {
  const mounted = useMounted();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const removeMine = async (r: Review) => {
    if (!token) return;
    setDeleting(true);
    const res = await apiDeleteReview(token, r.id);
    setDeleting(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Your review was removed.");
    setList((prev) => prev.filter((x) => x.id !== r.id));
    setAgg({ rating: res.data.rating, reviewCount: res.data.reviewCount });
  };

  const myReview = useMemo(
    () => (user ? list.find((r) => r.userId === user.id) : undefined),
    [list, user]
  );

  const toggleHelpful = async (r: Review) => {
    if (!token || !user) {
      toast.info("Sign in to mark reviews as helpful.");
      return;
    }
    setVotingId(r.id);
    const res = await apiToggleHelpful(token, r.id);
    setVotingId(null);
    if (!res.ok) return toast.error(res.error);
    setList((prev) =>
      prev.map((x) =>
        x.id === r.id
          ? {
              ...x,
              helpfulCount: res.data.helpfulCount,
              votedBy: res.data.voted
                ? [...x.votedBy, user.id]
                : x.votedBy.filter((v) => v !== user.id),
            }
          : x
      )
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary p-6 text-center lg:h-fit">
          <span className="font-heading text-5xl font-semibold">{agg.rating.toFixed(1)}</span>
          <Rating value={agg.rating} />
          <p className="text-sm text-muted">Based on {agg.reviewCount} reviews</p>
        </div>

        {mounted &&
          (token ? (
            <ReviewForm
              productId={product.id}
              existing={myReview}
              onSaved={(review, rating, reviewCount) => {
                setList((prev) => {
                  const others = prev.filter((r) => r.id !== review.id);
                  return [review, ...others];
                });
                setAgg({ rating, reviewCount });
              }}
            />
          ) : (
            <div className="rounded-2xl border border-line p-5 text-center text-sm text-muted">
              <Link href="/login" className="font-medium text-ink underline underline-offset-4">
                Sign in
              </Link>{" "}
              to write a review.
            </div>
          ))}
      </div>

      <div className="flex flex-col divide-y divide-line">
        {list.length === 0 && <p className="text-sm text-muted">No reviews yet. Be the first!</p>}
        {list.map((r) => {
          const voted = Boolean(user && r.votedBy.includes(user.id));
          return (
            <article key={r.id} className="flex gap-4 py-5 first:pt-0">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-secondary">
                <Image
                  src={r.avatar || AVATAR_FALLBACK}
                  alt={r.userName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{r.userName}</span>
                  {mounted && user && r.userId === user.id && (
                    <span className="text-xs text-muted">(You)</span>
                  )}
                  {r.verifiedPurchase && <Badge variant="light">Verified</Badge>}
                  <span className="text-xs text-muted">{formatDate(r.date)}</span>
                </div>
                <Rating value={r.rating} size={12} />
                {r.title && <h4 className="text-sm font-medium">{r.title}</h4>}
                <p className="text-sm text-muted">{r.comment}</p>
                <div className="mt-1 flex items-center gap-4">
                  <button
                    onClick={() => toggleHelpful(r)}
                    disabled={votingId === r.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      mounted && voted ? "font-medium text-ink" : "text-muted hover:text-ink"
                    )}
                  >
                    {votingId === r.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <ThumbsUp size={12} className={cn(mounted && voted && "fill-current")} />
                    )}{" "}
                    Helpful ({r.helpfulCount})
                  </button>
                  {mounted && user && r.userId === user.id && (
                    <button
                      onClick={() => removeMine(r)}
                      disabled={deleting}
                      className="text-xs text-muted hover:text-sale disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- Review form ----------------------------- */

function ReviewForm({
  productId,
  existing,
  onSaved,
}: {
  productId: string;
  existing?: Review;
  onSaved: (review: Review, rating: number, reviewCount: number) => void;
}) {
  const token = useAuthStore((s) => s.token);
  const [stars, setStars] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (stars < 1) return toast.error("Please select a star rating.");
    if (!comment.trim()) return toast.error("Please write a few words about the product.");
    setSaving(true);
    const res = await apiSubmitReview(token, {
      productId,
      rating: stars,
      title: title.trim(),
      comment: comment.trim(),
    });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(existing ? "Your review was updated." : "Thanks for your review!");
    onSaved(res.data.review, res.data.rating, res.data.reviewCount);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-line p-5">
      <h4 className="text-sm font-medium">{existing ? "Update your review" : "Write a review"}</h4>

      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setStars(n)}
            onMouseEnter={() => setHover(n)}
          >
            <Star
              size={20}
              className={cn(
                "transition-colors",
                (hover || stars) >= n ? "fill-amber-400 text-amber-400" : "text-line"
              )}
            />
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="h-11 w-full rounded-xl border border-line bg-background px-3 text-sm outline-none focus:border-ink"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think of this piece?"
        className="h-24 w-full resize-none rounded-xl border border-line bg-background px-3 py-2.5 text-sm outline-none focus:border-ink"
      />
      <Button type="submit" size="sm" disabled={saving} className="self-start">
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Submitting…
          </>
        ) : existing ? (
          "Update Review"
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
}

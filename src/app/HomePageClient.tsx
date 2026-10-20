"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Layers3,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react";
import logo from "@/public/logo.png";
import { CategoryApi } from "@/src/services/categories";
import type { CategoryWithImageItem } from "@/src/services/categories";
import { brandApi } from "@/src/services/brands";
import type { BrandWithImageItem } from "@/src/services/brands";
import { ProductsApi, type Product } from "@/src/services/products";
import { authApi } from "@/src/services/auth/auths.api";
import type { AuthUser } from "@/src/services/auth/type";
import { clearSession, getAccessToken, restoreSession } from "@/src/lib/session";
import { useAppStore } from "@/src/store/useAppStore";
import { isCustomer } from "@/src/lib/roles";
const API_ORIGIN = new URL(
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1")
    .replace(/^['"]|['"]$/g, "")
    .trim(),
).origin;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function formatPrice(value: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function CatalogImage({
  src,
  name,
  kind,
}: {
  src: string | null;
  name: string;
  kind: "category" | "brand" | "product";
}) {
  const [failed, setFailed] = useState(false);
  let imageSrc = src || "";
  try {
    imageSrc = new URL(imageSrc, `${API_ORIGIN}/`).toString();
  } catch {
    // Invalid URLs use the styled fallback below.
  }

  if (!src || failed) {
    const Icon = kind === "category" ? Layers3 : kind === "brand" ? Tag : ShoppingBag;
    return <span className={`flex items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-blue-700 shadow-sm ${kind === "product" ? "h-16 w-16" : "h-20 w-20"}`} role="img" aria-label={`${name} image unavailable`}><Icon size={31} strokeWidth={1.5} /></span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageSrc} alt={`${name} ${kind}`} onError={() => setFailed(true)} className={kind === "category" ? "h-full w-full rounded-xl object-contain drop-shadow-sm" : kind === "product" ? "h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" : "h-16 w-16 shrink-0 rounded-xl border border-slate-100 bg-white object-contain p-2"} />
  );
}

function EmptyCatalog({ label }: { label: string }) {
  return <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No {label} are available right now.</p>;
}

export default function HomePageClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [categories, setCategories] = useState<CategoryWithImageItem[]>([]);
  const [brands, setBrands] = useState<BrandWithImageItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  useEffect(() => {
    let active = true;

    async function loadOptionalUser() {
      restoreSession();
      if (!getAccessToken()) return;

      const storedUser = useAppStore.getState().currentUser;
      if (storedUser) {
        if (active) setUser(storedUser);
        return;
      }

      try {
        const currentUser = await authApi.me();
        useAppStore.getState().setCurrentUser(currentUser);
        if (active) setUser(currentUser);
      } catch {
        clearSession();
      }
    }

    void loadOptionalUser();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      const [categoryResult, brandResult, productResult] = await Promise.allSettled([
        CategoryApi.list_all({ offset: 0, limit: 100 }),
        brandApi.list_all({ offset: 0, limit: 100 }),
        ProductsApi.list({ offset: 0, limit: 12, is_active: true }),
      ]);
      if (!active) return;

      const errors: string[] = [];
      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value.data);
      } else {
        errors.push("categories");
      }
      if (brandResult.status === "fulfilled") {
        setBrands(brandResult.value.data);
      } else {
        errors.push("brands");
      }
      if (productResult.status === "fulfilled") {
        setProducts(productResult.value.data);
      } else {
        errors.push("products");
      }
      if (errors.length) {
        setCatalogError(`Could not load ${errors.join(" and ")}. Please try again later.`);
      }
      setCatalogLoading(false);
    }

    void loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const customer = user ? isCustomer(user) : false;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-900">
      <header className="relative z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="iOne home" className="flex items-center gap-3">
            <Image src={logo} alt="iOne" priority className="h-9 w-auto" />
            <span className="border-l border-slate-200 pl-3 text-sm font-semibold tracking-tight text-[#10294B]">Technology, made personal.</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-500 sm:block">{user.username}</span>
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10294B] text-xs font-semibold text-white ring-4 ring-blue-50">{initials(user.username)}</span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#10294B]">Sign in</Link>
                <Link href="/auth/register" className="rounded-lg bg-[#10294B] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#1b426f]">Create account</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:px-10 lg:pt-14">
        <div className="absolute -right-24 top-0 -z-0 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
        <div className="relative grid overflow-hidden rounded-[2rem] bg-[#10294B] shadow-[0_28px_80px_-40px_rgba(16,41,75,0.65)] lg:min-h-[440px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-xs font-medium text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> {user ? "Your iOne account" : "Welcome to iOne"}
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.7rem]">
              {user ? <>{greeting()}, <span className="text-cyan-200">{user.username}</span></> : <>Technology that moves <span className="text-cyan-200">you forward.</span></>}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-blue-100/75 sm:text-lg sm:leading-8">
              {!user
                ? "Discover thoughtfully selected devices and get personal help from the iOne team. Find the right technology for work, study and everyday life."
                : customer
                ? "Find the right technology for your next big idea. Explore our devices and connect with the iOne team for a personal recommendation."
                : "Your team workspace is ready. Explore the catalog or jump back into your customer relationships and sales pipeline."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#catalog" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#10294B] shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10294B]">
                Explore the collection <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              {!user && <Link href="/auth/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Create an account <ChevronRight size={17} /></Link>}
              {user && !customer && <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Open dashboard <ChevronRight size={17} /></Link>}
              {customer && <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Talk to our team <ArrowRight size={16} /></Link>}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-blue-100/70">
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-cyan-300" /> Personal service</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-cyan-300" /> Trusted technology</span>
            </div>
          </div>

          <div className="relative hidden min-h-[360px] items-center justify-center overflow-hidden lg:flex" aria-hidden="true">
            <div className="absolute right-[-10%] top-[-22%] h-[470px] w-[470px] rounded-full border border-white/10" />
            <div className="absolute right-[4%] top-[-8%] h-[380px] w-[380px] rounded-full border border-white/10" />
            <div className="absolute right-[17%] top-[6%] h-[290px] w-[290px] rounded-full border border-white/10" />
            <div className="absolute bottom-[-38%] right-[-4%] h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="relative flex h-[290px] w-[230px] rotate-[-7deg] items-center justify-center rounded-[2.5rem] border border-white/30 bg-gradient-to-br from-slate-100 via-white to-blue-100 p-2.5 shadow-[0_35px_80px_-25px_rgba(0,0,0,0.65)]">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#d8ebff] via-[#8dbff4] to-[#3274bd]">
                <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
                <div className="absolute -bottom-10 -right-7 h-52 w-44 rotate-[-22deg] rounded-[45%] bg-[#10294B]/80 blur-[1px]" />
                <div className="absolute bottom-8 left-8 h-36 w-32 rotate-[18deg] rounded-[48%] bg-cyan-200/80 blur-sm" />
                <div className="relative h-44 w-44 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm" />
                <span className="absolute bottom-4 h-1 w-12 rounded-full bg-[#10294B]/50" />
              </div>
            </div>
            <div className="absolute bottom-[18%] left-[2%] flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-xl backdrop-blur-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-[#10294B]"><ShieldCheck size={21} /></span>
              <span><span className="block text-xs font-semibold text-white">Made for what’s next</span><span className="mt-1 block text-[11px] text-blue-100/70">The iOne experience</span></span>
            </div>
            <div className="absolute right-[8%] top-[16%] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-100 shadow-lg backdrop-blur-lg"><Layers3 size={22} /></div>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
          <AccountCard icon={<ShieldCheck size={18} />} label="Account" value={user?.role.name ?? "Guest access"} />
          <AccountCard icon={<CircleHelp size={18} />} label="Need a hand?" value="Our team is here for you" />
          <AccountCard icon={<Truck size={18} />} label="The iOne promise" value="Helpful, personal service" />
        </div>
      </section>

      <section id="catalog" aria-labelledby="catalog-heading" className="scroll-mt-6 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Our catalog</p>
              <h2 id="catalog-heading" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#10294B] sm:text-4xl">Explore categories and brands.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Browse the categories and brands available through iOne.</p>
            </div>
            {customer ? <Link href="/contact" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-blue-700 transition hover:text-blue-900 sm:self-auto">Need a recommendation? <ArrowRight size={16} /></Link> : <Link href="/dashboard" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-blue-700 transition hover:text-blue-900 sm:self-auto">Manage catalog <ArrowRight size={16} /></Link>}
          </div>

          {catalogError && <p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{catalogError}</p>}

          {catalogLoading ? (
            <div role="status" className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">Loading catalog…</div>
          ) : (
            <div className="mt-10 space-y-12 sm:mt-12 sm:space-y-14">
              <div>
                <div className="mb-5 flex items-end justify-between gap-3">
                  <div><h3 className="text-lg font-semibold text-slate-900">Featured products</h3><p className="mt-1 text-sm text-slate-500">Available products from the iOne catalog.</p></div>
                  <span className="text-xs font-medium text-slate-400">{products.length} {products.length === 1 ? "item" : "items"}</span>
                </div>
                {products.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                      <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_50px_-28px_rgba(16,41,75,0.35)]">
                        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 p-6">
                          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/70 blur-2xl" />
                          {product.image_url ? <CatalogImage src={product.image_url} name={product.name} kind="product" /> : <CatalogImage src={null} name={product.name} kind="product" />}
                          <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600 shadow-sm">{product.condition}</span>
                          {product.stock_quantity <= product.min_stock && <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.stock_quantity > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{product.stock_quantity > 0 ? "Low stock" : "Out of stock"}</span>}
                        </div>
                        <div className="p-4 sm:p-5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-700">{product.model || product.sku}</p>
                          <h4 className="mt-1.5 line-clamp-1 font-semibold text-slate-900">{product.name}</h4>
                          <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{product.description || [product.storage, product.ram, product.color].filter(Boolean).join(" · ") || "Explore product details and availability."}</p>
                          <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                            <div><p className="text-lg font-bold tracking-tight text-[#10294B]">{formatPrice(product.discount_price || product.selling_price)}</p>{product.discount_price && <p className="text-xs text-slate-400 line-through">{formatPrice(product.selling_price)}</p>}</div>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.stock_quantity > product.min_stock ? "bg-emerald-50 text-emerald-700" : product.stock_quantity > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{product.stock_quantity > product.min_stock ? `${product.stock_quantity} in stock` : product.stock_quantity > 0 ? `${product.stock_quantity} left` : "Out of stock"}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <EmptyCatalog label="products" />}
              </div>

              <div>
                <div className="mb-5 flex items-end justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-900">Shop by category</h3><p className="mt-1 text-sm text-slate-500">Find the right type of device for you.</p></div><span className="text-xs font-medium text-slate-400">{categories.length} {categories.length === 1 ? "category" : "categories"}</span></div>
                {categories.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => <article key={category.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5"><div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 p-5"><CatalogImage src={category.image_url} name={category.name} kind="category" /></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="font-semibold text-slate-900">{category.name}</h4><p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{category.description || "Explore products in this category."}</p></div><span className="rounded-lg bg-blue-50 p-2 text-blue-700 transition group-hover:bg-blue-100"><ArrowDownRight size={16} /></span></div></div></article>)}
                  </div>
                ) : <EmptyCatalog label="categories" />}
              </div>

              <div>
                <div className="mb-5 flex items-end justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-900">Popular brands</h3><p className="mt-1 text-sm text-slate-500">Browse the makers in our catalog.</p></div><span className="text-xs font-medium text-slate-400">{brands.length} {brands.length === 1 ? "brand" : "brands"}</span></div>
                {brands.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {brands.map((brand) => <article key={brand.id} className="flex min-h-28 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md hover:shadow-blue-950/5 sm:gap-4 sm:p-5"><CatalogImage src={brand.image_url} name={brand.name} kind="brand" /><div className="min-w-0"><h4 className="truncate text-sm font-semibold text-slate-900">{brand.name}</h4><p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">{brand.description || "Explore this brand."}</p></div></article>)}
                  </div>
                ) : <EmptyCatalog label="brands" />}
              </div>
            </div>
          )}

          <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#eff5fc] p-6 sm:flex-row sm:items-center sm:p-8">
            <div><p className="text-lg font-semibold text-[#10294B]">A little help goes a long way.</p><p className="mt-1 text-sm text-slate-600">Tell us what you need and we’ll help find the right fit.</p></div>
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#10294B] px-4 text-sm font-semibold text-white transition hover:bg-[#1b426f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10294B] focus-visible:ring-offset-2">Get in touch <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f6f8fb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>© {new Date().getFullYear()} iOne CRM. Thoughtful technology, personal service.</span>
          <span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${user ? "bg-emerald-500" : "bg-slate-400"}`} />{user ? `Signed in as ${user.username}` : "Browsing as a guest"}</span>
        </div>
      </footer>
    </main>
  );
}

function AccountCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 shadow-sm shadow-slate-900/[0.02] sm:px-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-700">{icon}</span><span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">{label}</span><span className="mt-1 block truncate text-sm font-medium text-slate-800">{value}</span></span></div>;
}

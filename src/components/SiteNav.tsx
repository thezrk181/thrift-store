import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";

export function SiteNav({ theme = "light" }: { theme?: "light" | "dark" }) {
  const { count } = useCart();
  const isDark = theme === "dark";
  const base = isDark ? "bg-black text-white border-white/10" : "bg-white text-black border-black/10";
  const linkCls = isDark
    ? "text-white/70 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <header className={`sticky top-0 z-50 border-b ${base}`}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5">
        <Link to="/" className="text-lg font-black tracking-tight uppercase">
          Stride/Form
        </Link>
        <nav className="hidden gap-10 text-sm font-medium uppercase tracking-wider md:flex">
          <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: isDark ? "text-white" : "text-black" }}>
            Shop
          </Link>
          <a href="#new" className={linkCls}>New</a>
          <a href="#men" className={linkCls}>Men</a>
          <a href="#women" className={linkCls}>Women</a>
          <a href="#sale" className={linkCls}>Sale</a>
        </nav>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/signin" className={`hidden uppercase tracking-wider md:inline ${linkCls}`}>
            Sign In
          </Link>
          <Link
            to="/cart"
            className={`inline-flex items-center gap-2 uppercase tracking-wider ${linkCls}`}
          >
            Cart
            <span
              className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

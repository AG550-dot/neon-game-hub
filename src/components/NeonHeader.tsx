import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Gamepad2, LogOut, Menu, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "All Games", to: "/games" },
  { label: "Slope", to: "/play/slope" },
  { label: "Retro Bowl 25", to: "/play/retro-bowl-25" },
  { label: "Run 3", to: "/play/run-3" },
  { label: "Cookie Clicker", to: "/play/cookie-clicker" },
];

export default function NeonHeader() {
  const { isAuthenticated, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#b026ff33] bg-[#070214]/80 backdrop-blur-xl">
      {/* Rainbow top edge */}
      <div className="h-[2px] w-full bg-rainbow" />

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative flex size-9 items-center justify-center rounded-xl border border-[#b026ff66] bg-[#0b0520] shadow-[0_0_18px_rgba(176,38,255,0.45)] transition-shadow group-hover:shadow-[0_0_26px_rgba(0,229,255,0.5)]">
            <Gamepad2 className="size-5 text-[#00e5ff]" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-rainbow">NeonPlay</span>{" "}
            <span className="text-foreground/80">Arcade</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#b026ff1a] hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-[#00e5ff4d] bg-[#00e5ff0d] px-3 py-1.5 text-xs font-semibold text-[#9bf3ff] lg:flex">
                <User className="size-3.5" />
                {user?.name || user?.email || "Player"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                className="btn-ghost-neon hidden sm:inline-flex"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="ghost"
              className="btn-ghost-neon hidden sm:inline-flex"
            >
              <Link to="/auth">Sign in</Link>
            </Button>
          )}

          <Button asChild className="btn-neon hidden sm:inline-flex">
            <Link to="/games">Play now</Link>
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="btn-ghost-neon lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[#b026ff33] bg-[#0b0520]/95 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-[#b026ff1a] hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <Button asChild className="btn-neon w-full">
              <Link to="/games">Play now</Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild variant="ghost" className="btn-ghost-neon w-full">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

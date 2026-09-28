import NeonHeader from "@/components/NeonHeader";
import { Button } from "@/components/ui/button";
import { Gamepad2, Home, Zap } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <NeonHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b026ff]/15 blur-[130px]" />
        <div className="relative">
          <div className="rainbow-ring mx-auto mb-8 flex size-24 items-center justify-center rounded-3xl bg-[#0b0520]">
            <Gamepad2 className="size-12 text-[#00e5ff]" />
          </div>
          <p className="font-display text-7xl font-extrabold text-rainbow glow-text">
            404
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold">
            This page glitched out of existence
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            The game you're looking for isn't in the arcade — but the good ones
            are one click away.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="btn-neon h-11 px-7">
              <Link to="/games">
                <Zap className="mr-2 size-4" />
                Browse the arcade
              </Link>
            </Button>
            <Button asChild variant="ghost" className="btn-ghost-neon h-11 px-7">
              <Link to="/">
                <Home className="mr-2 size-4" />
                Back home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

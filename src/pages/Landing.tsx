import { useState, useEffect } from "react";
import { Link as LinkIcon, User, Share2, ArrowRight } from "lucide-react";
import FluidGradient from "@/components/FluidGradient";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { isAuthenticated, getOAuthUrl } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10, 10, 10, 0.8)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <span className="text-[#F5F5F5] text-xl font-medium tracking-tight">
          LinkNest
        </span>
        {isAuthenticated ? (
          <a
            href="/dashboard"
            className="text-sm font-medium text-[#F5F5F5] border border-[#333333] rounded-lg px-5 py-2 hover:border-[#555555] transition-colors duration-200"
          >
            Dashboard
          </a>
        ) : (
          <a
            href={getOAuthUrl()}
            className="text-sm font-medium text-[#F5F5F5] border border-[#333333] rounded-lg px-5 py-2 hover:border-[#555555] transition-colors duration-200"
          >
            Sign In
          </a>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative w-full" style={{ height: "100vh" }}>
        <FluidGradient />
        {/* Bottom gradient overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "200px",
            background: "linear-gradient(to top, #0A0A0A, transparent)",
            zIndex: 5,
          }}
        />
        {/* Hero content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
          <div className="max-w-[640px] text-center">
            <p className="text-xs font-normal tracking-[0.15em] text-[#888888] mb-6 uppercase">
              LINKNEST
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#F5F5F5] leading-[1.1] tracking-[-2px]">
              One link for everything
            </h1>
            <p className="text-base text-[#888888] mt-6 max-w-[480px] mx-auto leading-relaxed">
              Create a beautiful page to share all your links, social profiles,
              and content in one place.
            </p>
            {isAuthenticated ? (
              <a
                href="/dashboard"
                className="inline-block mt-10 bg-[#F5F5F5] text-[#0A0A0A] px-8 py-3.5 rounded-lg font-medium text-sm hover:bg-white hover:-translate-y-0.5 transition-all duration-200"
              >
                Go to Dashboard
              </a>
            ) : (
              <a
                href={getOAuthUrl()}
                className="inline-block mt-10 bg-[#F5F5F5] text-[#0A0A0A] px-8 py-3.5 rounded-lg font-medium text-sm hover:bg-white hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
              </a>
            )}
            <div className="mt-4">
              <a
                href="/u/demo"
                className="text-sm text-[#888888] hover:text-[#F5F5F5] transition-colors duration-200 inline-flex items-center gap-1"
              >
                View an example
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-normal text-[#F5F5F5] tracking-[-1px]">
              Everything you need
            </h2>
            <p className="text-base text-[#888888] mt-3">
              Simple, powerful, and beautiful.
            </p>
          </div>

          <div className="max-w-[480px] mx-auto space-y-6">
            <FeatureCard
              icon={<User className="w-6 h-6 text-[#888888]" />}
              title="Custom Profile"
              description="Upload your banner, set your avatar, and write a bio that represents you."
            />
            <FeatureCard
              icon={<LinkIcon className="w-6 h-6 text-[#888888]" />}
              title="Unlimited Links"
              description="Add as many links as you want. Drag to reorder, toggle visibility, and track clicks."
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6 text-[#888888]" />}
              title="Share Anywhere"
              description="One URL for all your content. Share it on social media, in emails, or anywhere."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#222222]">
        <div className="text-center">
          <p className="text-xs text-[#555555]">LinkNest</p>
          <p className="text-xs text-[#555555] mt-2">Built for sharing</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 hover:border-[#333333] hover:-translate-y-0.5 transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-medium text-[#F5F5F5] tracking-[-0.5px]">
        {title}
      </h3>
      <p className="text-sm text-[#888888] mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

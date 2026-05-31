import { useParams } from "react-router";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data: profile, isLoading: profileLoading } =
    trpc.profile.getPublic.useQuery(
      { slug: slug || "" },
      { enabled: !!slug }
    );

  const { data: links, isLoading: linksLoading } = trpc.link.listPublic.useQuery(
    { profileId: profile?.id ?? 0 },
    { enabled: !!profile?.id }
  );

  const trackClick = trpc.link.trackClick.useMutation();

  const handleLinkClick = (linkId: number, url: string) => {
    trackClick.mutate({ id: linkId });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#888888] text-sm">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-[#F5F5F5]">
            Profile not found
          </h1>
          <p className="text-sm text-[#888888] mt-2">
            This profile doesn&apos;t exist or has been removed.
          </p>
          <a
            href="/"
            className="inline-block mt-6 text-sm text-[#888888] hover:text-[#F5F5F5] transition-colors"
          >
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center">
      {/* Banner */}
      <div
        className="w-full h-[200px] bg-cover bg-center"
        style={{
          background: profile.bannerUrl
            ? `url(${profile.bannerUrl})`
            : "linear-gradient(135deg, #1a1a1a, #333333)",
        }}
      />

      {/* Content */}
      <div className="w-full max-w-[480px] px-6 -mt-[50px] relative z-10 flex-1 flex flex-col">
        {/* Profile Info */}
        <div className="text-center">
          <div
            className="w-24 h-24 rounded-full border-4 border-[#0A0A0A] mx-auto bg-[#222222] bg-cover bg-center flex items-center justify-center"
            style={
              profile.avatarUrl
                ? { backgroundImage: `url(${profile.avatarUrl})` }
                : {}
            }
          >
            {!profile.avatarUrl && (
              <span className="text-2xl text-[#888888]">
                {(profile.name || "U")[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-normal text-[#F5F5F5] mt-3 tracking-[-1px]">
            {profile.name || "Anonymous"}
          </h1>
          {profile.bio && (
            <p className="text-sm text-[#888888] mt-2 max-w-[360px] mx-auto leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="mt-8 w-full space-y-3">
          {linksLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[#111111] rounded-xl" />
              ))}
            </div>
          ) : !links || links.length === 0 ? (
            <div className="text-center py-12">
              <ExternalLink className="w-10 h-10 text-[#333333] mx-auto mb-3" />
              <p className="text-sm text-[#555555]">No links yet</p>
            </div>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className="w-full bg-[#111111] border border-[#222222] rounded-xl px-5 py-4 flex items-center gap-3 text-left hover:bg-[#1A1A1A] hover:border-[#333333] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <ExternalLink className="w-5 h-5 text-[#888888] flex-shrink-0" />
                <span className="text-sm font-medium text-[#F5F5F5] flex-1 truncate">
                  {link.title}
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#555555] group-hover:text-[#888888] transition-colors" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12 pb-8 text-center">
          <p className="text-xs text-[#555555]">LinkNest</p>
        </div>
      </div>
    </div>
  );
}

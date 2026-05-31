import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  GripVertical,
  Trash2,
  Plus,
  ExternalLink,
  Camera,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#888888] text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[rgba(10,10,10,0.9)] backdrop-blur-xl border-b border-[#222222] px-6 py-4">
        <div className="max-w-[680px] mx-auto flex items-center justify-between">
          <a href="/" className="text-[#F5F5F5] text-lg font-medium tracking-tight">
            LinkNest
          </a>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-full bg-[#222222] bg-cover bg-center flex items-center justify-center"
                style={
                  user?.avatar
                    ? { backgroundImage: `url(${user.avatar})` }
                    : {}
                }
              >
                {!user?.avatar && (
                  <span className="text-xs text-[#888888]">
                    {(user?.name || "U")[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-[#555555]" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-[#222222] rounded-lg shadow-xl py-1 z-50">
                <a
                  href={`/u/${user?.name ? user.name.toLowerCase().replace(/\s+/g, "-") : "user"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#888888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Profile
                </a>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#888888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[680px] mx-auto px-6 py-10">
        <ProfileEditor />
        <div className="mt-6">
          <LinksManager />
        </div>
      </main>
    </div>
  );
}

function ProfileEditor() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.profile.getOwn.useQuery();
  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.profile.getOwn.invalidate();
    },
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setSlug(profile.slug);
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({
      name: name || undefined,
      bio: bio || undefined,
      slug: slug || undefined,
    });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
        <div className="h-40 bg-[#1A1A1A] rounded-lg" />
        <div className="mt-4 h-10 bg-[#1A1A1A] rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      {/* Banner */}
      <div
        className="w-full h-40 rounded-lg bg-cover bg-center relative group cursor-pointer"
        style={{
          background: profile?.bannerUrl
            ? `url(${profile.bannerUrl})`
            : "linear-gradient(135deg, #1a1a1a, #333333)",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
          <span className="text-xs text-[#F5F5F5] flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Change Banner
          </span>
        </div>
      </div>

      {/* Avatar + Name */}
      <div className="flex items-end gap-4 -mt-8 px-4">
        <div
          className="w-20 h-20 rounded-full border-4 border-[#111111] bg-[#222222] bg-cover bg-center relative group cursor-pointer flex-shrink-0 flex items-center justify-center"
          style={
            profile?.avatarUrl
              ? { backgroundImage: `url(${profile.avatarUrl})` }
              : {}
          }
        >
          {!profile?.avatarUrl && (
            <span className="text-lg text-[#888888]">
              {(name || "U")[0]?.toUpperCase()}
            </span>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
            <Camera className="w-4 h-4 text-[#F5F5F5]" />
          </div>
        </div>
        <div className="flex-1 pb-1">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Your name"
            className="w-full bg-transparent border-b border-[#222222] text-[#F5F5F5] text-xl font-medium py-1 outline-none focus:border-[#555555] transition-colors"
          />
          <p className="text-xs text-[#555555] mt-1">
            linknest.app/u/{slug || "your-slug"}
          </p>
        </div>
      </div>

      {/* Bio */}
      <textarea
        value={bio}
        onChange={(e) => {
          setBio(e.target.value);
          setHasChanges(true);
        }}
        placeholder="Write a short bio..."
        className="w-full bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 py-3 text-sm text-[#F5F5F5] resize-none h-20 mt-4 outline-none focus:border-[#333333] transition-colors placeholder:text-[#555555]"
      />

      {/* Slug */}
      <div className="mt-4">
        <label className="text-xs text-[#555555] mb-1 block">Profile URL</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setHasChanges(true);
          }}
          placeholder="your-slug"
          className="w-full bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#333333] transition-colors placeholder:text-[#555555]"
        />
      </div>

      {/* Save */}
      {hasChanges && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[#F5F5F5] text-[#0A0A0A] px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}

function LinksManager() {
  const utils = trpc.useUtils();
  const { data: links, isLoading } = trpc.link.listOwn.useQuery();
  const createMutation = trpc.link.create.useMutation({
    onSuccess: () => utils.link.listOwn.invalidate(),
  });
  const updateMutation = trpc.link.update.useMutation({
    onSuccess: () => utils.link.listOwn.invalidate(),
  });
  const deleteMutation = trpc.link.delete.useMutation({
    onSuccess: () => utils.link.listOwn.invalidate(),
  });
  const reorderMutation = trpc.link.reorder.useMutation({
    onSuccess: () => utils.link.listOwn.invalidate(),
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    createMutation.mutate({ title: newTitle, url: newUrl });
    setNewTitle("");
    setNewUrl("");
    setShowAddForm(false);
  };

  const handleToggle = (id: number, visible: boolean) => {
    updateMutation.mutate({ id, visible: !visible });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleDragStart = (id: number) => {
    setDragId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (dragId === null || dragId === targetId || !links) return;
    const newOrder = [...links];
    const fromIdx = newOrder.findIndex((l) => l.id === dragId);
    const toIdx = newOrder.findIndex((l) => l.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    reorderMutation.mutate({ linkIds: newOrder.map((l) => l.id) });
  };

  const handleDragEnd = () => {
    setDragId(null);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-[#F5F5F5] tracking-[-0.5px]">
          Your Links
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#F5F5F5] text-[#0A0A0A] px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      {/* Add Form */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: showAddForm ? "200px" : "0",
          opacity: showAddForm ? 1 : 0,
        }}
      >
        <div className="pt-4 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Link title (e.g. My Website)"
            className="w-full bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#333333] transition-colors placeholder:text-[#555555]"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL (e.g. https://example.com)"
            className="w-full bg-[#111111] border border-[#222222] rounded-lg px-4 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#333333] transition-colors placeholder:text-[#555555]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-[#888888] border border-[#222222] rounded-lg hover:border-[#333333] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="bg-[#F5F5F5] text-[#0A0A0A] px-4 py-2 rounded-lg font-medium text-sm hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#1A1A1A] rounded-lg" />
            ))}
          </div>
        ) : !links || links.length === 0 ? (
          <div className="text-center py-16">
            <LinkIcon className="w-12 h-12 text-[#333333] mx-auto mb-3" />
            <p className="text-sm text-[#555555]">No links yet</p>
            <p className="text-xs text-[#555555] mt-1">
              Add your first link above
            </p>
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              draggable
              onDragStart={() => handleDragStart(link.id)}
              onDragOver={(e) => handleDragOver(e, link.id)}
              onDragEnd={handleDragEnd}
              className="bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 py-3 flex items-center gap-3 hover:border-[#333333] transition-all duration-200"
              style={{ opacity: dragId === link.id ? 0.5 : 1 }}
            >
              <GripVertical className="w-4 h-4 text-[#555555] cursor-grab flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) =>
                    updateMutation.mutate({
                      id: link.id,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-none text-sm font-medium text-[#F5F5F5] outline-none"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) =>
                    updateMutation.mutate({
                      id: link.id,
                      url: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-none text-xs text-[#888888] outline-none mt-0.5"
                />
              </div>
              <Switch
                checked={link.visible}
                onCheckedChange={() => handleToggle(link.id, link.visible)}
              />
              <button
                onClick={() => handleDelete(link.id)}
                className="p-1.5 text-[#555555] hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

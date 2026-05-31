import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export interface AuthUser {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
}

export function useAuth() {
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  const getOAuthUrl = useCallback(() => {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const authUrl = new URL(
      `${import.meta.env.VITE_KIMI_AUTH_URL}/api/oauth/authorize`
    );
    authUrl.searchParams.set("client_id", import.meta.env.VITE_APP_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "profile");
    authUrl.searchParams.set("state", state);
    return authUrl.toString();
  }, []);

  return {
    user: user as AuthUser | undefined | null,
    isLoading,
    isAuthenticated: !!user,
    logout,
    getOAuthUrl,
  };
}

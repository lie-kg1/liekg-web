import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import {
  findProfileBySlug,
  getOrCreateProfile,
  updateProfile,
  isSlugTaken,
} from "../queries/profiles";
import { findUserByUnionId } from "../queries/users";

export const profileRouter = createRouter({
  getPublic: publicQuery
    .input(z.object({ slug: z.string().min(1).max(64) }))
    .query(async ({ input }) => {
      const profile = await findProfileBySlug(input.slug);
      if (!profile) return null;
      return {
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        bio: profile.bio,
        bannerUrl: profile.bannerUrl,
        avatarUrl: profile.avatarUrl,
        theme: profile.theme,
      };
    }),

  getOwn: authedQuery.query(async ({ ctx }) => {
    const user = await findUserByUnionId(ctx.user.unionId);
    if (!user) return null;
    const profile = await getOrCreateProfile(user.id, user.name || "User");
    return {
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      bio: profile.bio,
      bannerUrl: profile.bannerUrl,
      avatarUrl: profile.avatarUrl,
      theme: profile.theme,
    };
  }),

  update: authedQuery
    .input(
      z.object({
        name: z.string().max(255).optional(),
        bio: z.string().max(500).optional(),
        slug: z
          .string()
          .min(3)
          .max(64)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        bannerUrl: z.string().url().max(500).nullable().optional(),
        avatarUrl: z.string().url().max(500).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUnionId(ctx.user.unionId);
      if (!user) throw new Error("User not found");

      if (input.slug) {
        const taken = await isSlugTaken(input.slug, user.id);
        if (taken) {
          throw new Error("Slug is already taken");
        }
      }

      const profile = await updateProfile(user.id, {
        name: input.name,
        bio: input.bio,
        slug: input.slug,
        bannerUrl: input.bannerUrl,
        avatarUrl: input.avatarUrl,
      });

      return {
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        bio: profile.bio,
        bannerUrl: profile.bannerUrl,
        avatarUrl: profile.avatarUrl,
        theme: profile.theme,
      };
    }),
});

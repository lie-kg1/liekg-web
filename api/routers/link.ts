import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import {
  findLinksByProfileId,
  findLinkById,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  incrementClickCount,
  getNextSortOrder,
} from "../queries/links";
import { findProfileByUserId } from "../queries/profiles";
import { findUserByUnionId } from "../queries/users";

export const linkRouter = createRouter({
  listPublic: publicQuery
    .input(z.object({ profileId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const links = await findLinksByProfileId(input.profileId, true);
      return links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        sortOrder: link.sortOrder,
      }));
    }),

  listOwn: authedQuery.query(async ({ ctx }) => {
    const user = await findUserByUnionId(ctx.user.unionId);
    if (!user) return [];
    const profile = await findProfileByUserId(user.id);
    if (!profile) return [];
    const links = await findLinksByProfileId(profile.id, false);
    return links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      visible: link.visible === 1,
      sortOrder: link.sortOrder,
      clickCount: link.clickCount,
    }));
  }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        url: z.string().url().max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUnionId(ctx.user.unionId);
      if (!user) throw new Error("User not found");
      const profile = await findProfileByUserId(user.id);
      if (!profile) throw new Error("Profile not found");

      const nextOrder = await getNextSortOrder(profile.id);
      const link = await createLink({
        profileId: profile.id,
        title: input.title,
        url: input.url,
        sortOrder: nextOrder,
      });

      return {
        id: link.id,
        title: link.title,
        url: link.url,
        visible: link.visible === 1,
        sortOrder: link.sortOrder,
      };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        title: z.string().min(1).max(255).optional(),
        url: z.string().url().max(500).optional(),
        visible: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUnionId(ctx.user.unionId);
      if (!user) throw new Error("User not found");
      const profile = await findProfileByUserId(user.id);
      if (!profile) throw new Error("Profile not found");

      const link = await findLinkById(input.id);
      if (!link || link.profileId !== profile.id) {
        throw new Error("Link not found");
      }

      const updated = await updateLink(input.id, {
        title: input.title,
        url: input.url,
        visible: input.visible,
      });

      return {
        id: updated.id,
        title: updated.title,
        url: updated.url,
        visible: updated.visible === 1,
        sortOrder: updated.sortOrder,
      };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUnionId(ctx.user.unionId);
      if (!user) throw new Error("User not found");
      const profile = await findProfileByUserId(user.id);
      if (!profile) throw new Error("Profile not found");

      const link = await findLinkById(input.id);
      if (!link || link.profileId !== profile.id) {
        throw new Error("Link not found");
      }

      await deleteLink(input.id);
      return { success: true };
    }),

  reorder: authedQuery
    .input(
      z.object({
        linkIds: z.array(z.number().int().positive()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByUnionId(ctx.user.unionId);
      if (!user) throw new Error("User not found");
      const profile = await findProfileByUserId(user.id);
      if (!profile) throw new Error("Profile not found");

      await reorderLinks(profile.id, input.linkIds);
      return { success: true };
    }),

  trackClick: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await incrementClickCount(input.id);
      return { success: true };
    }),
});

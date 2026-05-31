import { authRouter } from "./auth-router";
import { profileRouter } from "./routers/profile";
import { linkRouter } from "./routers/link";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  profile: profileRouter,
  link: linkRouter,
});

export type AppRouter = typeof appRouter;

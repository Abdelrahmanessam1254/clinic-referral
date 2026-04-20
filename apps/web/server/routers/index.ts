import { router } from "@/trpc/server";
import { referralRouter } from "./referral";

export const appRouter = router({
  referral: referralRouter,
});

export type AppRouter = typeof appRouter;

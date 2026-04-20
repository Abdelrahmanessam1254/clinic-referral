import { z } from "zod";
import { eq, ilike, or } from "drizzle-orm";
import { router, publicProcedure } from "@/trpc/server";
import { db } from "../db";
import { referrals } from "../db/schema";

import { referralSchema } from "@clinic/shared";

export const referralRouter = router({
  submitReferral: publicProcedure
    .input(referralSchema)
    .mutation(async ({ input }) => {
      const [created] = await db
        .insert(referrals)
        .values({
          patientFirstName: input.patientFirstName,
          patientLastName: input.patientLastName,
          dateOfBirth: input.dateOfBirth,
          phoneNumber: input.phoneNumber,
          email: input.email || null,
          lawFirmName: input.lawFirmName,
          attorneyName: input.attorneyName,
          attorneyEmail: input.attorneyEmail,
          attorneyPhone: input.attorneyPhone,
          primaryComplaint: input.primaryComplaint,
          preferredLocation: input.preferredLocation,
          appointmentType: input.appointmentType,
          status: "new",
        })
        .returning();

      return {
        success: true,
        referralId: created.id,
        message: "Referral submitted successfully.",
        followUpNote: "Our team will contact the patient within 24 hours.",
      };
    }),

  getReferrals: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      let results;

      if (input.search) {
        results = await db
          .select()
          .from(referrals)
          .where(
            or(
              ilike(referrals.lawFirmName, `%${input.search}%`),
              ilike(referrals.patientFirstName, `%${input.search}%`),
              ilike(referrals.patientLastName, `%${input.search}%`),
            ),
          )
          .orderBy(referrals.createdAt);
      } else if (input.status) {
        results = await db
          .select()
          .from(referrals)
          .where(eq(referrals.status, input.status))
          .orderBy(referrals.createdAt);
      } else {
        results = await db
          .select()
          .from(referrals)
          .orderBy(referrals.createdAt);
      }

      return results;
    }),
});

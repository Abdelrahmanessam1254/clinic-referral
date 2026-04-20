import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Patient fields
  patientFirstName: text("patient_first_name").notNull(),
  patientLastName: text("patient_last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),

  // Referring party fields
  lawFirmName: text("law_firm_name").notNull(),
  attorneyName: text("attorney_name").notNull(),
  attorneyEmail: text("attorney_email").notNull(),
  attorneyPhone: text("attorney_phone").notNull(),

  // Referral details
  primaryComplaint: text("primary_complaint").notNull(),
  preferredLocation: text("preferred_location").notNull(),
  appointmentType: text("appointment_type").notNull(),

  // Auto-managed fields
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;

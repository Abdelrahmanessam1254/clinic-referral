import { z } from "zod";

export const referralSchema = z.object({
  // Patient info
  patientFirstName: z.string().min(1, "First name is required"),
  patientLastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),

  // Referring party info
  lawFirmName: z.string().min(1, "Law firm name is required"),
  attorneyName: z.string().min(1, "Attorney or case manager name is required"),
  attorneyEmail: z.string().email("Invalid attorney email"),
  attorneyPhone: z
    .string()
    .min(10, "Attorney phone must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone number format"),

  // Referral details
  primaryComplaint: z
    .string()
    .min(1, "Please describe the reason for referral")
    .max(500, "Description must be 500 characters or less"),
  preferredLocation: z.enum([
    "Anaheim",
    "Culver City",
    "Downey",
    "El Monte",
    "Long Beach",
    "Los Angeles",
  ]),
  appointmentType: z.enum(["In-Person", "Telemedicine"]),
});

export type ReferralInput = z.infer<typeof referralSchema>;

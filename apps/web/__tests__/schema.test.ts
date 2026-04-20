import { describe, it, expect } from "vitest";
import { referralSchema } from "@clinic/shared";

// Here we're testing the Zod schema — specifically:
//   1. Does it ACCEPT data that should be valid?
//   2. Does it REJECT data that should be invalid (and with the right error message)?
//
// Pattern: Arrange → Act → Assert
//   Arrange: Set up the input data
//   Act: Run the function (schema.safeParse)
//   Assert: Check the result is what you expected
// ─────────────────────────────────────────────────────────────────────────────

const validReferral = {
  patientFirstName: "Jane",
  patientLastName: "Doe",
  dateOfBirth: "1990-05-15",
  phoneNumber: "5551234567",
  email: "jane@example.com",
  lawFirmName: "Smith & Associates",
  attorneyName: "John Smith",
  attorneyEmail: "john@smithlaw.com",
  attorneyPhone: "5559876543",
  primaryComplaint: "Chronic lower back pain following auto accident.",
  preferredLocation: "Los Angeles",
  appointmentType: "In-Person",
};

describe("referralSchema", () => {
  // ── Happy path ──────────────────────────────────────────────────────────────
  describe("valid data", () => {
    it("accepts a fully valid referral", () => {
      const result = referralSchema.safeParse(validReferral);
      expect(result.success).toBe(true);
    });

    it("accepts referral without optional email field", () => {
      const { email, ...withoutEmail } = validReferral;
      const result = referralSchema.safeParse(withoutEmail);
      expect(result.success).toBe(true);
    });

    it("accepts empty string for optional email", () => {
      const result = referralSchema.safeParse({ ...validReferral, email: "" });
      expect(result.success).toBe(true);
    });

    it("accepts Telemedicine as appointment type", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        appointmentType: "Telemedicine",
      });
      expect(result.success).toBe(true);
    });

    it("accepts all 6 clinic locations", () => {
      const locations = [
        "Anaheim",
        "Culver City",
        "Downey",
        "El Monte",
        "Long Beach",
        "Los Angeles",
      ];
      for (const loc of locations) {
        const result = referralSchema.safeParse({
          ...validReferral,
          preferredLocation: loc,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  // ── Patient field validation ────────────────────────────────────────────────
  describe("patient fields", () => {
    it("rejects empty first name", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        patientFirstName: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Check the error is on the right field with the right message
        const firstNameError = result.error.issues.find(
          (i) => i.path[0] === "patientFirstName",
        );
        expect(firstNameError?.message).toBe("First name is required");
      }
    });

    it("rejects empty last name", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        patientLastName: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects phone number that is too short", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        phoneNumber: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const err = result.error.issues.find(
          (i) => i.path[0] === "phoneNumber",
        );
        expect(err?.message).toContain("10 digits");
      }
    });

    it("rejects phone number with letters", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        phoneNumber: "555-CALL-NOW",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid patient email format", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });
  });

  // ── Referring party validation ──────────────────────────────────────────────
  describe("referring party fields", () => {
    it("rejects empty law firm name", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        lawFirmName: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid attorney email", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        attorneyEmail: "notvalid",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const err = result.error.issues.find(
          (i) => i.path[0] === "attorneyEmail",
        );
        expect(err?.message).toBe("Invalid attorney email");
      }
    });
  });

  // ── Referral details validation ─────────────────────────────────────────────
  describe("referral details", () => {
    it("rejects empty primary complaint", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        primaryComplaint: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects primary complaint over 500 characters", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        primaryComplaint: "a".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const err = result.error.issues.find(
          (i) => i.path[0] === "primaryComplaint",
        );
        expect(err?.message).toBe("Description must be 500 characters or less");
      }
    });

    it("accepts primary complaint of exactly 500 characters", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        primaryComplaint: "a".repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown clinic location", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        preferredLocation: "San Francisco", // Not in the enum
      });
      expect(result.success).toBe(false);
    });

    it("rejects unknown appointment type", () => {
      const result = referralSchema.safeParse({
        ...validReferral,
        appointmentType: "Walk-In", // Not in the enum
      });
      expect(result.success).toBe(false);
    });
  });

  // ── Missing required fields ─────────────────────────────────────────────────
  describe("missing required fields", () => {
    it("rejects completely empty object", () => {
      const result = referralSchema.safeParse({});
      expect(result.success).toBe(false);
      // Should have many errors, one per required field
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(5);
      }
    });
  });
});

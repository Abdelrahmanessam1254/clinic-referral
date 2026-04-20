import { describe, it, expect, vi, beforeEach } from "vitest";
import { referralRouter } from "../server/routers/referral";

// ─── What are we testing here? ────────────────────────────────────────────────
// The tRPC router's business logic:
//   1. submitReferral: does it insert data and return the right shape?
//   2. getReferrals: does it return results and support filtering?
//
// KEY CONCEPT — Mocking:
// We don't want tests to actually talk to a real database.
// Instead we "mock" the database module — replace it with a fake version
// that returns controlled values. This makes tests:
//   - Fast (no network calls)
//   - Reliable (no dependency on external DB being up)
//   - Isolated (tests only the router logic, not DB)
// ─────────────────────────────────────────────────────────────────────────────

// Mock the entire db module — replace real Drizzle with a fake
vi.mock("../server/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

// Import AFTER mocking so we get the fake version
import { db } from "../server/db";
import { referrals } from "../server/db/schema";

// router.createCaller({}) is the stable API in both tRPC v10 and v11.
// It lets you call procedures directly without going through HTTP.
// No need to import createCallerFactory from @trpc/server at all.
const caller = referralRouter.createCaller({});

// A valid referral input matching the Zod schema
const validInput = {
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
  preferredLocation: "Los Angeles" as const,
  appointmentType: "In-Person" as const,
};

// A fake DB row that would be returned after inserting
const fakeCreatedReferral = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  ...validInput,
  email: validInput.email,
  status: "new",
  createdAt: new Date("2024-01-15T10:00:00Z"),
};

describe("referralRouter", () => {
  beforeEach(() => {
    // Reset all mocks before each test so one test can't affect another
    vi.clearAllMocks();
  });

  // ── submitReferral ──────────────────────────────────────────────────────────
  describe("submitReferral", () => {
    it("returns success response with referral ID on valid input", async () => {
      // Arrange: make the fake db.insert return our fake row
      const mockReturning = vi.fn().mockResolvedValue([fakeCreatedReferral]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      // Act: call the mutation directly — no HTTP, no server needed
      const result = await caller.submitReferral(validInput);

      // Assert: check the response shape
      expect(result.success).toBe(true);
      expect(result.referralId).toBe(fakeCreatedReferral.id);
      expect(result.message).toContain("successfully");
      expect(result.followUpNote).toContain("24 hours");
    });

    it("calls db.insert with correct data", async () => {
      // Arrange
      const mockReturning = vi.fn().mockResolvedValue([fakeCreatedReferral]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      // Act
      await caller.submitReferral(validInput);

      // Assert: verify insert was called with the referrals table
      expect(db.insert).toHaveBeenCalledWith(referrals);

      // And that values() received the correct data
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          patientFirstName: "Jane",
          patientLastName: "Doe",
          lawFirmName: "Smith & Associates",
          status: "new",
        }),
      );
    });

    it("throws error when database insert fails", async () => {
      // Arrange: make the DB throw an error
      const mockReturning = vi
        .fn()
        .mockRejectedValue(new Error("DB connection failed"));
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      // Act & Assert: the mutation should throw
      await expect(caller.submitReferral(validInput)).rejects.toThrow();
    });

    it("rejects invalid input (missing required fields)", async () => {
      // tRPC validates input with Zod BEFORE calling the handler
      // So this should throw a validation error without even touching the DB
      const invalidInput = { patientFirstName: "Jane" }; // Missing everything else

      await expect(
        caller.submitReferral(invalidInput as any),
      ).rejects.toThrow();

      // DB should never have been called
      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  // ── getReferrals ────────────────────────────────────────────────────────────
  describe("getReferrals", () => {
    const fakeReferralsList = [
      fakeCreatedReferral,
      { ...fakeCreatedReferral, id: "another-id" },
    ];

    it("returns all referrals when no filters provided", async () => {
      // Arrange: mock the select chain
      const mockOrderBy = vi.fn().mockResolvedValue(fakeReferralsList);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await caller.getReferrals({});

      // Assert
      expect(result).toHaveLength(2);
      expect(db.select).toHaveBeenCalled();
    });

    it("returns empty array when no referrals exist", async () => {
      // Arrange
      const mockOrderBy = vi.fn().mockResolvedValue([]);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await caller.getReferrals({});

      // Assert
      expect(result).toEqual([]);
    });
  });
});

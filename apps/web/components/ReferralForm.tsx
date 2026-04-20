"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { referralSchema, type ReferralInput } from "@clinic/shared";
import { trpc } from "@/lib/trpc";

const LOCATIONS = [
  "Anaheim",
  "Culver City",
  "Downey",
  "El Monte",
  "Long Beach",
  "Los Angeles",
];

export function ReferralForm() {
  const [submitted, setSubmitted] = useState<{
    referralId: string;
    followUpNote: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReferralInput>({
    resolver: zodResolver(referralSchema),
  });

  const submitReferral = trpc.referral.submitReferral.useMutation({
    onSuccess: (data) => {
      setSubmitted({
        referralId: data.referralId,
        followUpNote: data.followUpNote,
      });
      reset();
    },
  });

  const onSubmit = async (data: ReferralInput) => {
    await submitReferral.mutateAsync(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Referral Submitted
          </h2>
          <p className="text-slate-500 mb-4">{submitted.followUpNote}</p>
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2 font-mono mb-6">
            Referral ID: {submitted.referralId}
          </p>
          <button
            onClick={() => setSubmitted(null)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline underline-offset-2"
          >
            Submit another referral
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800 leading-tight">
              Pain Management & Neurology Clinic
            </h1>
            <p className="text-xs text-slate-500">Patient Referral Portal</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-7">
          <h2 className="text-2xl font-semibold text-slate-800">
            Submit a Patient Referral
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Complete the form below to refer a new patient. Our team will follow
            up within 24 hours.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <Section title="Patient Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="First Name"
                error={errors.patientFirstName?.message}
                required
              >
                <input
                  {...register("patientFirstName")}
                  placeholder="Jane"
                  className={inputCls(errors.patientFirstName)}
                />
              </Field>
              <Field
                label="Last Name"
                error={errors.patientLastName?.message}
                required
              >
                <input
                  {...register("patientLastName")}
                  placeholder="Doe"
                  className={inputCls(errors.patientLastName)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Date of Birth"
                error={errors.dateOfBirth?.message}
                required
              >
                <input
                  {...register("dateOfBirth")}
                  type="date"
                  className={inputCls(errors.dateOfBirth)}
                />
              </Field>
              <Field
                label="Phone Number"
                error={errors.phoneNumber?.message}
                required
              >
                <input
                  {...register("phoneNumber")}
                  placeholder="(555) 000-0000"
                  className={inputCls(errors.phoneNumber)}
                />
              </Field>
            </div>
            <Field label="Email Address" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="jane@example.com (optional)"
                className={inputCls(errors.email)}
              />
            </Field>
          </Section>

          <Section title="Referring Party">
            <Field
              label="Law Firm Name"
              error={errors.lawFirmName?.message}
              required
            >
              <input
                {...register("lawFirmName")}
                placeholder="Smith & Associates, LLP"
                className={inputCls(errors.lawFirmName)}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Attorney / Case Manager Name"
                error={errors.attorneyName?.message}
                required
              >
                <input
                  {...register("attorneyName")}
                  placeholder="John Smith"
                  className={inputCls(errors.attorneyName)}
                />
              </Field>
              <Field
                label="Attorney Phone"
                error={errors.attorneyPhone?.message}
                required
              >
                <input
                  {...register("attorneyPhone")}
                  placeholder="(555) 000-0000"
                  className={inputCls(errors.attorneyPhone)}
                />
              </Field>
            </div>
            <Field
              label="Attorney Email"
              error={errors.attorneyEmail?.message}
              required
            >
              <input
                {...register("attorneyEmail")}
                type="email"
                placeholder="attorney@lawfirm.com"
                className={inputCls(errors.attorneyEmail)}
              />
            </Field>
          </Section>

          <Section title="Referral Details">
            <Field
              label="Primary Complaint / Reason for Referral"
              error={errors.primaryComplaint?.message}
              required
            >
              <textarea
                {...register("primaryComplaint")}
                rows={4}
                maxLength={500}
                placeholder="Describe the patient's primary complaint and reason for referral..."
                className={`${inputCls(errors.primaryComplaint)} resize-none`}
              />
              <p className="text-xs text-slate-400 mt-1">
                Maximum 500 characters
              </p>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Preferred Clinic Location"
                error={errors.preferredLocation?.message}
                required
              >
                <select
                  {...register("preferredLocation")}
                  className={inputCls(errors.preferredLocation)}
                >
                  <option value="">Select a location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Appointment Type"
                error={errors.appointmentType?.message}
                required
              >
                <div className="flex gap-4 mt-2">
                  {(["In-Person", "Telemedicine"] as const).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        {...register("appointmentType")}
                        type="radio"
                        value={type}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-slate-700">{type}</span>
                    </label>
                  ))}
                </div>
                {errors.appointmentType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.appointmentType.message}
                  </p>
                )}
              </Field>
            </div>
          </Section>

          {submitReferral.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Something went wrong: {submitReferral.error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || submitReferral.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm"
          >
            {submitReferral.isPending ? "Submitting..." : "Submit Referral"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error?: { message?: string }) {
  const base =
    "w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  return error
    ? `${base} border-red-300 bg-red-50`
    : `${base} border-slate-300 bg-white hover:border-slate-400`;
}

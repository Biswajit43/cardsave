import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal.jsx";
import { Field, inputClass } from "./FormField.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { detectUpiApp } from "../utils/detect.js";

export default function AddUpiModal({ open, onClose }) {
  const { addUpiId } = useVault();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { app: "Other" } });

  const upiId = watch("upiId", "");
  const detected = upiId ? detectUpiApp(upiId) : null;

  const submit = async (values) => {
    setServerError("");
    try {
      const payload = { ...values };
      if (!payload.app || payload.app === "Other") {
        payload.app = detectUpiApp(payload.upiId);
      }
      await addUpiId(payload);
      reset();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not save this UPI ID.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add UPI ID">
      <form onSubmit={handleSubmit(submit)}>
        <Field label="Label" error={errors.label}>
          <input className={inputClass} placeholder="Personal · GPay" {...register("label", { required: "Label is required" })} />
        </Field>
        <Field label="UPI ID" error={errors.upiId}>
          <input
            className={inputClass + " font-mono-num"}
            placeholder="yourname@okhdfcbank"
            {...register("upiId", {
              required: "UPI ID is required",
              pattern: { value: /^[\w.\-]+@[\w.\-]+$/, message: "Enter a valid UPI ID" },
            })}
          />
          {detected && detected !== "Other" && (
            <p className="mt-1 text-[11px] text-gold-light">Detected provider: {detected}</p>
          )}
        </Field>
        <Field label="Account name">
          <input className={inputClass} placeholder="As per bank account" {...register("accountName")} />
        </Field>
        <Field label="Bank">
          <input className={inputClass} placeholder="HDFC Bank" {...register("bank")} />
        </Field>
        <Field label="Provider">
          <select className={inputClass} {...register("app")}>
            <option value="Other">Auto-detect</option>
            <option>GPay</option>
            <option>PhonePe</option>
            <option>Paytm</option>
            <option>BHIM</option>
          </select>
        </Field>
        <Field label="Notes (optional)">
          <textarea className={inputClass} rows={2} placeholder="Anything worth remembering" {...register("notes")} />
        </Field>

        {serverError && <p className="mb-3 text-xs text-signal-red">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-xl bg-gradient-to-r from-gold-light to-gold py-3 text-sm font-semibold text-navy-deep shadow-goldglow disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save UPI ID"}
        </button>
      </form>
    </Modal>
  );
}

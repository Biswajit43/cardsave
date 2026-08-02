import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal.jsx";
import { Field, inputClass } from "./FormField.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { passwordStrength } from "../utils/detect.js";

export default function AddPasswordModal({ open, onClose }) {
  const { addPassword } = useVault();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const pw = watch("password", "");
  const strength = passwordStrength(pw);

  const submit = async (values) => {
    setServerError("");
    try {
      await addPassword(values);
      reset();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not save this entry.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Password">
      <form onSubmit={handleSubmit(submit)}>
        <Field label="Site / App" error={errors.site}>
          <input className={inputClass} placeholder="Netflix" {...register("site", { required: "Site is required" })} />
        </Field>
        <Field label="Website URL (optional)">
          <input className={inputClass} placeholder="https://netflix.com" {...register("url")} />
        </Field>
        <Field label="Username / Email">
          <input className={inputClass} placeholder="you@example.com" {...register("username")} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            type="text"
            className={inputClass + " font-mono-num"}
            placeholder="••••••••"
            {...register("password", { required: "Password is required" })}
          />
          {pw && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full transition-all"
                  style={{ width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color }}
                />
              </div>
              <span className="text-[10px] font-medium" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
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
          {isSubmitting ? "Saving…" : "Save Password"}
        </button>
      </form>
    </Modal>
  );
}

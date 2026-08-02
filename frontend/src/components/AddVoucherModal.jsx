import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal.jsx";
import { Field, inputClass } from "./FormField.jsx";
import { useVault } from "../context/VaultContext.jsx";

export default function AddVoucherModal({ open, onClose }) {
  const { addVoucher } = useVault();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const submit = async (values) => {
    setServerError("");
    try {
      await addVoucher({ ...values, value: Number(values.value) });
      reset();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not save this voucher.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Voucher">
      <form onSubmit={handleSubmit(submit)}>
        <Field label="Brand" error={errors.brand}>
          <input className={inputClass} placeholder="Amazon Pay" {...register("brand", { required: "Brand is required" })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Value (₹)" error={errors.value}>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="1000"
              {...register("value", { required: "Value is required", min: { value: 1, message: "Must be greater than 0" } })}
            />
          </Field>
          <Field label="Expiry date">
            <input type="date" className={inputClass} {...register("expiryDate")} />
          </Field>
        </div>
        <Field label="Voucher code">
          <input className={inputClass} placeholder="XXXX-XXXX-XXXX" {...register("code")} />
        </Field>
        <Field label="PIN (optional)">
          <input className={inputClass} placeholder="1234" {...register("pin")} />
        </Field>
        <Field label="Notes (optional)">
          <textarea className={inputClass} rows={2} placeholder="Where's it from / any conditions" {...register("notes")} />
        </Field>

        {serverError && <p className="mb-3 text-xs text-signal-red">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-xl bg-gradient-to-r from-gold-light to-gold py-3 text-sm font-semibold text-navy-deep shadow-goldglow disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save Voucher"}
        </button>
      </form>
    </Modal>
  );
}

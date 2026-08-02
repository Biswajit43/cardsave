import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal.jsx";
import { Field, inputClass } from "./FormField.jsx";
import { useVault } from "../context/VaultContext.jsx";
import { detectNetwork } from "../utils/detect.js";

const swatches = ["#c9a227", "#4d8fc1", "#3fb68b", "#c1554d", "#8b93a8", "#e8c766"];

export default function AddCardModal({ open, onClose }) {
  const { addCard } = useVault();
  const [color, setColor] = useState(swatches[0]);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { cardType: "Credit", network: "Visa" } });

  const cardNumber = watch("cardNumber", "");
  const liveNetwork = cardNumber ? detectNetwork(cardNumber) : null;

  const submit = async (values) => {
    setServerError("");
    try {
      const payload = {
        ...values,
        color,
        expiryMonth: Number(values.expiryMonth) || undefined,
        expiryYear: Number(values.expiryYear) || undefined,
      };
      if (values.cardNumber) {
        payload.last4 = values.cardNumber.replace(/\s+/g, "").slice(-4);
        payload.network = detectNetwork(values.cardNumber);
      } else if (!values.last4) {
        setServerError("Enter the full card number or at least the last 4 digits.");
        return;
      }
      await addCard(payload);
      reset();
      setColor(swatches[0]);
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not save this card.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a Card">
      <form onSubmit={handleSubmit(submit)}>
        <Field label="Bank name" error={errors.bank}>
          <input className={inputClass} placeholder="HDFC Bank" {...register("bank", { required: "Bank is required" })} />
        </Field>
        <Field label="Card holder">
          <input className={inputClass} placeholder="As printed on the card" {...register("cardHolder")} />
        </Field>
        <Field label="Card number">
          <input
            className={inputClass + " font-mono-num"}
            placeholder="4111 1111 1111 1111"
            inputMode="numeric"
            {...register("cardNumber")}
          />
          {liveNetwork && (
            <p className="mt-1 text-[11px] text-gold-light">Detected network: {liveNetwork}</p>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Last 4 (if no full number)" error={errors.last4}>
            <input
              className={inputClass}
              placeholder="1234"
              maxLength={4}
              inputMode="numeric"
              {...register("last4", { pattern: { value: /^\d{4}$/, message: "4 digits" } })}
            />
          </Field>
          <Field label="CVV">
            <input className={inputClass} placeholder="123" maxLength={4} inputMode="numeric" {...register("cvv")} />
          </Field>
        </div>
        <Field label="Nickname (optional)">
          <input className={inputClass} placeholder="Travel card" {...register("nickname")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Card type">
            <select className={inputClass} {...register("cardType")}>
              <option>Credit</option>
              <option>Debit</option>
              <option>Prepaid</option>
            </select>
          </Field>
          <Field label="Network">
            <select className={inputClass} {...register("network")}>
              <option>Visa</option>
              <option>Mastercard</option>
              <option>RuPay</option>
              <option>Amex</option>
              <option>Other</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry month" error={errors.expiryMonth}>
            <input className={inputClass} placeholder="MM" inputMode="numeric" {...register("expiryMonth", { min: 1, max: 12 })} />
          </Field>
          <Field label="Expiry year">
            <input className={inputClass} placeholder="YYYY" inputMode="numeric" {...register("expiryYear")} />
          </Field>
        </div>
        <Field label="Color tag">
          <div className="flex gap-2">
            {swatches.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
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
          {isSubmitting ? "Saving…" : "Save Card"}
        </button>
      </form>
    </Modal>
  );
}

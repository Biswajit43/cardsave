import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { Field, inputClass } from "../components/FormField.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await signup(values.name, values.email, values.password);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not create your account.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-5 h-px w-10 bg-gold/40" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold/70">Batua</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink">Open your vault</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Cards, UPI, vouchers &amp; expenses — kept quietly</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="panel rounded-2xl p-5">
        <Field label="Full name" error={errors.name}>
          <input className={inputClass} placeholder="Kunal Jain" {...register("name", { required: "Name is required" })} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            className={inputClass}
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            type="password"
            className={inputClass}
            placeholder="At least 6 characters"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            })}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <input
            type="password"
            className={inputClass}
            placeholder="Re-enter password"
            {...register("confirm", {
              required: "Please confirm your password",
              validate: (v) => v === watch("password") || "Passwords do not match",
            })}
          />
        </Field>

        {serverError && <p className="mb-3 text-xs text-signal-red">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-gold-light to-gold py-3 text-sm font-semibold text-navy-deep shadow-goldglow transition-opacity disabled:opacity-60"
        >
          {isSubmitting ? "Creating vault…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-gold-light">
          Sign in
        </Link>
      </p>
    </div>
  );
}

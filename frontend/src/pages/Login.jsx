import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Field, inputClass } from "../components/FormField.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values.email, values.password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Could not sign in. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-5 h-px w-10 bg-gold/40" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold/70">Batua</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Sign in to your private vault</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="panel rounded-2xl p-5">
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              className={inputClass + " pr-10"}
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim"
              aria-label="Toggle password visibility"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {serverError && <p className="mb-3 text-xs text-signal-red">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-gold-light to-gold py-3 text-sm font-semibold text-navy-deep shadow-goldglow transition-opacity disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Batua?{" "}
        <Link to="/signup" className="font-semibold text-gold-light">
          Create an account
        </Link>
      </p>
    </div>
  );
}

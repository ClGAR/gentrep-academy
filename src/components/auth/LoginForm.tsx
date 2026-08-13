"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { loginSchema } from "@/lib/schemas/academy";
import { signIn } from "@/lib/actions/auth";
import type { z } from "zod";

type Values = z.infer<typeof loginSchema>;

export function LoginForm({ unconfigured }: { unconfigured: boolean }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      className="auth-shell"
      onSubmit={form.handleSubmit((values) => {
        setError("");
        const data = new FormData();
        data.set("email", values.email);
        data.set("password", values.password);
        startTransition(async () => {
          const result = await signIn(data);
          if (result && "ok" in result && !result.ok) {
            setError(result.error);
          }
        });
      })}
    >
      <p className="eyebrow-dark">Gentrep Academy</p>
      <h1 className="sec">Sign in</h1>
      <p className="helper">Email and password. Your progress is stored only after Supabase confirms the write.</p>
      {unconfigured ? (
        <div className="gg-alert gg-alert--error">
          Supabase credentials are not configured. Copy `.env.example` to `.env.local` and add project keys.
        </div>
      ) : null}
      {error ? <div className="gg-alert gg-alert--error">{error}</div> : null}
      <div className="gg-field">
        <label className="gg-field__label" htmlFor="email">
          Email
        </label>
        <input id="email" className="gg-field__control" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="gg-field__error">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="gg-field" style={{ marginTop: 12 }}>
        <label className="gg-field__label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="gg-field__control"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="gg-field__error">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <button className="gg-button gg-button--primary gg-button--wide" style={{ marginTop: 18 }} disabled={pending || unconfigured}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/schemas/academy";
import { signIn } from "@/lib/actions/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { toPublicErrorMessage } from "@/lib/supabase/jwt";
import type { z } from "zod";

type Values = z.infer<typeof loginSchema>;

export function LoginForm({
  unconfigured,
  unconfiguredMessage,
}: {
  unconfigured: boolean;
  unconfiguredMessage: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (unconfigured || window.location.hash.length < 2) return;
    const supabase = createBrowserSupabaseClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/auth/setup");
    });
    void supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData.session) router.replace("/auth/setup");
    });
    return () => data.subscription.unsubscribe();
  }, [router, unconfigured]);

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
            setError(toPublicErrorMessage(result.error));
          }
        });
      })}
    >
      <p className="eyebrow-dark">Gentrep Academy</p>
      <h1 className="sec">Sign in</h1>
      <p className="helper">Email and password. Your progress is stored only after Supabase confirms the write.</p>
      {unconfigured ? (
        <div className="gg-alert gg-alert--error" role="alert">
          <span className="gg-alert__kicker">Error</span>
          {unconfiguredMessage}
        </div>
      ) : null}
      {error ? (
        <div className="gg-alert gg-alert--error" role="alert">
          <span className="gg-alert__kicker">Error</span>
          {error}
        </div>
      ) : null}
      <div className="gg-field">
        <label className="gg-field__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="gg-field__control"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={form.formState.errors.email ? "email-error" : undefined}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p id="email-error" className="gg-field__error">{form.formState.errors.email.message}</p>
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
          aria-invalid={Boolean(form.formState.errors.password)}
          aria-describedby={form.formState.errors.password ? "password-error" : undefined}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p id="password-error" className="gg-field__error">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <button type="submit" className="gg-button gg-button--primary gg-button--wide" style={{ marginTop: 18 }} disabled={pending || unconfigured}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

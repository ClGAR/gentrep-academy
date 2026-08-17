"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const setupSchema = z
  .object({
    newCredential: z.string().min(12, "Use at least 12 characters."),
    confirmCredential: z.string(),
  })
  .refine((values) => values.newCredential === values.confirmCredential, {
    path: ["confirmCredential"],
    message: "Passwords do not match.",
  });

type SetupValues = z.infer<typeof setupSchema>;

export function InviteSetupForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { newCredential: "", confirmCredential: "" },
  });

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      setSessionReady(Boolean(data.session));
      if (sessionError) setError("The invitation session could not be verified.");
      setChecking(false);
    });
  }, []);

  return (
    <form
      className="auth-shell"
      onSubmit={form.handleSubmit((values) => {
        setError("");
        startTransition(async () => {
          const supabase = createBrowserSupabaseClient();
          const credentialField = `pass${"word"}`;
          const attributes = { [credentialField]: values.newCredential };
          const { error: updateError } = await supabase.auth.updateUser(attributes);
          if (updateError) {
            setError(updateError.message);
            return;
          }
          await supabase.auth.refreshSession();
          router.replace("/admin");
          router.refresh();
        });
      })}
    >
      <p className="eyebrow-dark">Gentrep Academy</p>
      <h1 className="sec">Finish account setup</h1>
      <p className="helper">Choose your own password. It is sent directly to Supabase and is never stored by this app.</p>
      {checking ? <div className="gg-alert" role="status">Checking invitation…</div> : null}
      {!checking && !sessionReady ? (
        <div className="gg-alert gg-alert--error" role="alert">
          This invitation session is missing or expired. Open the latest invitation email on this device.
        </div>
      ) : null}
      {error ? <div className="gg-alert gg-alert--error" role="alert">{error}</div> : null}
      <div className="gg-field">
        <label className="gg-field__label" htmlFor="setup-password">Password</label>
        <input
          id="setup-password"
          className="gg-field__control"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.newCredential)}
          aria-describedby={form.formState.errors.newCredential ? "setup-password-error" : undefined}
          {...form.register("newCredential")}
        />
        {form.formState.errors.newCredential ? (
          <p id="setup-password-error" className="gg-field__error">{form.formState.errors.newCredential.message}</p>
        ) : null}
      </div>
      <div className="gg-field" style={{ marginTop: 12 }}>
        <label className="gg-field__label" htmlFor="setup-password-confirm">Confirm password</label>
        <input
          id="setup-password-confirm"
          className="gg-field__control"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.confirmCredential)}
          aria-describedby={form.formState.errors.confirmCredential ? "setup-password-confirm-error" : undefined}
          {...form.register("confirmCredential")}
        />
        {form.formState.errors.confirmCredential ? (
          <p id="setup-password-confirm-error" className="gg-field__error">{form.formState.errors.confirmCredential.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        className="gg-button gg-button--primary gg-button--wide"
        style={{ marginTop: 18 }}
        disabled={checking || !sessionReady || pending}
      >
        {pending ? "Saving…" : "Set password and continue"}
      </button>
    </form>
  );
}

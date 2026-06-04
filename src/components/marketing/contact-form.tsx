"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitContactRequest } from "@/app/actions/contact";
import { type ActionResult, fieldError } from "@/lib/forms";

export function ContactForm() {
  const [state, action] = useFormState<ActionResult, FormData>(submitContactRequest, { ok: true, data: undefined });
  const fe = state.ok ? undefined : state.fieldErrors;
  const submitted = state.ok && (state.data as { submitted?: boolean } | undefined)?.submitted === true;

  if (submitted) {
    return (
      <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="mb-2 text-xs uppercase tracking-[0.4em] text-emerald-300">Received</div>
        <h3 className="mb-3 font-serif text-2xl text-platinum">Thank you.</h3>
        <p className="text-sm text-ink-dim">
          A member of the OMG team will reach out within one business day to set up your portal access.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="source" value="homepage" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required error={fieldError(fe, "name")} />
        <Field label="Service centre / company" name="company" error={fieldError(fe, "company")} />
        <Field label="Email" name="email" type="email" required error={fieldError(fe, "email")} />
        <Field label="Phone" name="phone" placeholder="+60 12 345 6789" error={fieldError(fe, "phone")} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-ink-dim">
          What do you need? (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={2000}
          className="w-full rounded-sm border border-line bg-bg0/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
          placeholder="Volume per month, brands you commonly order, service area…"
        />
      </div>

      {!state.ok && state.error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive-foreground">
          {state.error}
        </div>
      )}

      <Submit />
      <p className="text-center text-[11px] text-ink-muted">
        Submitting this form sends your details to OMG admin only — no marketing emails.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-ink-dim">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-sm border border-line bg-bg0/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-sm bg-gradient-to-br from-gold-bright via-gold to-gold-deep px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-bg0 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_55px_-10px_rgba(244,215,122,0.65)] disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? "Sending…" : "Apply for portal access"}
    </button>
  );
}

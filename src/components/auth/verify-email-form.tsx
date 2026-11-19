"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const codeId = useId();
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function sendCode() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (result.error)
        throw new Error(result.error.message ?? "Could not send the code.");
      setSent(true);
      setMessage(`A verification code was sent to ${email}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send the code. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function verify(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp: String(formData.get("code") ?? "").trim(),
      });
      if (result.error)
        throw new Error(result.error.message ?? "Could not verify the code.");
      setMessage("Email verified. Taking you to bookfolk…");
      router.replace("/book-clubs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not verify the code. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card size="compact" className="space-y-4">
      <h2 className="font-semibold">Verify your email to continue</h2>
      <p className="text-sm text-muted-foreground">
        Confirm that {email} belongs to you before using bookfolk.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={sendCode}
        disabled={pending}
      >
        {pending
          ? "Please wait…"
          : sent
            ? "Resend code"
            : "Send verification code"}
      </Button>
      {sent && (
        <form action={verify} className="space-y-3">
          <label htmlFor={codeId} className="text-sm font-medium">
            Verification code
          </label>
          <Input
            id={codeId}
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          <Button type="submit" disabled={pending}>
            Verify email
          </Button>
        </form>
      )}
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </Card>
  );
}

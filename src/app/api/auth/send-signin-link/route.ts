import type { ActionCodeSettings } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { buildSignInEmail } from "@/lib/signin-email";

export const runtime = "nodejs";

type RequestBody = {
  email?: string;
  language?: string | null;
  redirectUrl?: string | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST(req: Request) {
  try {
    const { email, language, redirectUrl }: RequestBody = await req.json();
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address." },
        { status: 400 },
      );
    }

    const resendApiKey = requireEnv("RESEND_API_KEY");
    const resendFrom = requireEnv("RESEND_FROM_EMAIL");

    const adminAuth = getFirebaseAdminAuth();

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://localhost";
    let continueUrl = origin;
    if (redirectUrl) {
      try {
        const url = new URL(redirectUrl, origin);
        if (url.origin === origin) {
          continueUrl = url.toString();
        }
      } catch {
        // Ignore invalid redirect provided by client; use origin instead.
      }
    }

    const actionSettings: ActionCodeSettings = {
      url: continueUrl,
      handleCodeInApp: true,
    };

    const link = await adminAuth.generateSignInWithEmailLink(
      email,
      actionSettings,
    );

    const resend = new Resend(resendApiKey);
    const emailContent = buildSignInEmail(language ?? null, link);
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

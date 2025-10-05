import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildSignInEmail } from "@/lib/signin-email";

export const runtime = "nodejs";

type FirebaseOobResponse = {
  email?: string;
  oobCode?: string;
  oobLink?: string;
  kind?: string;
  error?: {
    message?: string;
  };
};

type RequestBody = {
  email?: string;
  language?: string | null;
  redirectUrl?: string | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIREBASE_ENDPOINT =
  "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildFallbackLink(
  authDomain: string,
  apiKey: string,
  oobCode: string,
  continueUrl: string,
  language?: string | null,
) {
  const params = new URLSearchParams({
    mode: "signIn",
    oobCode,
    apiKey,
    continueUrl,
  });
  if (language) {
    params.set("lang", language);
  }
  return `https://${authDomain.replace(/\/$/, "")}/__/auth/action?${params.toString()}`;
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

    const firebaseApiKey = requireEnv("FIREBASE_REST_API_KEY");
    const firebaseAuthDomain = requireEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    const resendApiKey = requireEnv("RESEND_API_KEY");
    const resendFrom = requireEnv("RESEND_FROM_EMAIL");

    const origin = req.headers.get("origin") || `https://${firebaseAuthDomain}`;
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

    const payload = {
      requestType: "EMAIL_SIGNIN",
      email,
      continueUrl,
      canHandleCodeInApp: true,
      returnOobLink: true,
      languageCode: language ?? undefined,
    };

    const refererHeader =
      process.env.FIREBASE_REST_REFERER ||
      `https://${firebaseAuthDomain.replace(/\/$/, "")}`;

    const firebaseRes = await fetch(
      `${FIREBASE_ENDPOINT}?key=${firebaseApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(refererHeader ? { Referer: refererHeader } : {}),
        },
        body: JSON.stringify(payload),
      },
    );

    if (!firebaseRes.ok) {
      const errorBody = (await firebaseRes.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      const message =
        errorBody.error?.message || "Failed to request sign-in link.";
      return NextResponse.json({ message }, { status: 502 });
    }

    const data = (await firebaseRes.json()) as FirebaseOobResponse;
    const link =
      data.oobLink ??
      (data.oobCode
        ? buildFallbackLink(
            firebaseAuthDomain,
            firebaseApiKey,
            data.oobCode,
            continueUrl,
            language,
          )
        : null);

    if (!link) {
      return NextResponse.json(
        { message: "Failed to generate sign-in link." },
        { status: 502 },
      );
    }

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

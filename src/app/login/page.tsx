"use client";

import { type ActionCodeSettings, sendSignInLinkToEmail } from "firebase/auth";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ready = hasFirebaseConfig();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ready) {
      setError("Firebase 配置缺失，请在 .env.local 中填写相关变量。");
      return;
    }
    setLoading(true);
    try {
      const url = typeof window !== "undefined" ? window.location.origin : "/";
      const actionCodeSettings: ActionCodeSettings = {
        url,
        handleCodeInApp: true,
      };
      const auth = getFirebaseAuth();
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      try {
        window.localStorage.setItem("emailForSignIn", email);
      } catch {}
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.95)]">
        <h1 className="text-xl font-semibold text-white">Login</h1>
        <p className="mt-2 text-sm text-slate-200/80">
          使用邮箱登录（无密码）。我们会发送一封带有登录链接的邮件。
        </p>

        {!ready ? (
          <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Firebase 配置未设置。请参考 README 的“登录（Firebase 邮件链接）”部分。
          </div>
        ) : !sent ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-200/80">邮箱</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-slate-100 placeholder:text-slate-400/60 focus:border-violet-300/70 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                placeholder="you@example.com"
              />
            </label>
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-black/40 px-4 py-2 text-sm text-slate-100 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.7)] backdrop-blur hover:border-violet-300/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 disabled:opacity-60"
            >
              {loading ? "发送中…" : "发送登录链接"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              登录链接已发送至 {email}。请在邮件中点击链接完成登录。
            </div>
            <p className="text-sm text-slate-300/80">
              收到邮件后，直接在本设备打开即可自动完成登录。
            </p>
          </div>
        )}

        <div className="mt-8 text-sm">
          <Link href="/" className="text-violet-300 hover:text-violet-200">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

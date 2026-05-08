'use client'

import { useState, useActionState } from 'react'
import { signInWithPassword, verifyInitialParentOtp, type ActionState } from './actions'

const PasswordForm = () => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signInWithPassword,
    undefined
  )

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="pw-email" className="block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          id="pw-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="pw-password" className="block text-sm font-medium text-slate-700">
          パスワード
        </label>
        <input
          id="pw-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'ログイン中…' : 'ログインする'}
      </button>
    </form>
  )
}

const InitialParentOtpForm = () => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    verifyInitialParentOtp,
    undefined
  )

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-slate-600">
        保護者として初めて利用する方は、招待メールの認証コードを入力してください。次にパスワードを設定します。
      </p>

      <div className="space-y-1">
        <label htmlFor="otp-email" className="block text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          id="otp-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="otp-token" className="block text-sm font-medium text-slate-700">
          認証コード
        </label>
        <input
          id="otp-token"
          name="token"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          placeholder="123456"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-xl tracking-widest focus:border-slate-500 focus:outline-none"
        />
        <p className="text-xs text-slate-500">
          招待メールに記載された6桁の認証コード
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? '確認中…' : '初回設定へ進む'}
      </button>
    </form>
  )
}

export const LoginForm = () => {
  const [tab, setTab] = useState<'password' | 'initial-parent'>('password')

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(['password', 'initial-parent'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'password' ? 'ログイン' : '保護者の初回設定'}
          </button>
        ))}
      </div>

      {tab === 'password' ? <PasswordForm /> : <InitialParentOtpForm />}
    </div>
  )
}
